/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { isEmpty, findKey, cloneDeep } from 'lodash';
import { OpenSearchDashboardsRequest } from '../../../../src/core/server';
import { SecuritySessionCookie } from '../session/security_cookie';
import { SecurityPluginConfigType } from '..';
import { GLOBAL_TENANT_SYMBOL, PRIVATE_TENANT_SYMBOL, globalTenantName } from '../../common';

export const PRIVATE_TENANTS: string[] = [PRIVATE_TENANT_SYMBOL, 'private'];
export const GLOBAL_TENANTS: string[] = ['global', GLOBAL_TENANT_SYMBOL];
/**
 * Resovles the tenant the user is using.
 *
 * @param request OpenSearchDashboards request.
 * @param config security plugin config.
 * @param cookie cookie extracted from the request. The cookie should have been parsed by AuthenticationHandler.
 * pass it as parameter instead of extracting again.
 * @param authInfo authentication info, the Elasticsearch authinfo API response.
 *
 * @returns user preferred tenant of the request.
 */
export function resolveTenant(
  request: OpenSearchDashboardsRequest,
  username: string,
  roles: string[] | undefined,
  availabeTenants: any,
  config: SecurityPluginConfigType,
  cookie: SecuritySessionCookie
): string | undefined {
  const DEFAULT_READONLY_ROLES = ['kibana_read_only'];
  let selectedTenant: string | undefined;
  const securityTenant_ = request?.url?.searchParams?.get('securityTenant_');
  const securitytenant = request?.url?.searchParams?.get('securitytenant');
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const security_tenant = request?.url?.searchParams?.get('security_tenant');
  if (securityTenant_) {
    selectedTenant = securityTenant_;
  } else if (securitytenant) {
    selectedTenant = securitytenant;
  } else if (security_tenant) {
    selectedTenant = security_tenant;
  } else if (request.headers.securitytenant || request.headers.securityTenant_) {
    selectedTenant = request.headers.securitytenant
      ? (request.headers.securitytenant as string)
      : (request.headers.securityTenant_ as string);
  } else if (isValidTenant(cookie.tenant)) {
    selectedTenant = cookie.tenant;
  } else {
    selectedTenant = undefined;
  }
  const isReadonly = roles?.some(
    (role) => config.readonly_mode?.roles.includes(role) || DEFAULT_READONLY_ROLES.includes(role)
  );

  const preferredTenants = config.multitenancy?.tenants.preferred;
  const globalTenantEnabled = config.multitenancy?.tenants.enable_global;
  const privateTenantEnabled = config.multitenancy?.tenants.enable_private && !isReadonly;

  return resolve(
    username,
    selectedTenant,
    preferredTenants,
    availabeTenants,
    globalTenantEnabled,
    privateTenantEnabled
  );
}

function resolve(
  username: string,
  requestedTenant: string | undefined,
  preferredTenants: string[] | undefined,
  availableTenants: any, // is an object like { tenant_name_1: true, tenant_name_2: false, ... }
  globalTenantEnabled: boolean,
  privateTenantEnabled: boolean
): string | undefined {
  const availableTenantsClone = cloneDeep(availableTenants);
  delete availableTenantsClone[username];

  if (!globalTenantEnabled && !privateTenantEnabled && isEmpty(availableTenantsClone)) {
    return undefined;
  }

  if (isValidTenant(requestedTenant)) {
    requestedTenant = requestedTenant!;
    if (requestedTenant in availableTenants) {
      return requestedTenant;
    }

    if (
      privateTenantEnabled &&
      username in availableTenants &&
      PRIVATE_TENANTS.indexOf(requestedTenant) > -1
    ) {
      return PRIVATE_TENANT_SYMBOL;
    }

    if (globalTenantEnabled && GLOBAL_TENANTS.indexOf(requestedTenant) > -1) {
      return GLOBAL_TENANT_SYMBOL;
    }
  }

  if (preferredTenants && !isEmpty(preferredTenants)) {
    for (const element of preferredTenants) {
      const tenant = element.toLowerCase();

      if (globalTenantEnabled && GLOBAL_TENANTS.indexOf(tenant) > -1) {
        return GLOBAL_TENANT_SYMBOL;
      }

      if (
        privateTenantEnabled &&
        PRIVATE_TENANTS.indexOf(tenant) > -1 &&
        username in availableTenants
      ) {
        return PRIVATE_TENANT_SYMBOL;
      }

      if (tenant in availableTenants) {
        return tenant;
      }
    }
  }

  if (globalTenantEnabled) {
    return GLOBAL_TENANT_SYMBOL;
  }

  if (privateTenantEnabled) {
    return PRIVATE_TENANT_SYMBOL;
  }

  /**
   * fall back to the first tenant in the available tenants
   * Under the condition of enabling multitenancy, if the user has disabled both 'Global' and 'Private' tenants:
   * it will remove the default global tenant key for custom tenant.
   */
  if (
    Object.keys(availableTenantsClone).length > 1 &&
    availableTenantsClone.hasOwnProperty(globalTenantName)
  ) {
    delete availableTenantsClone[globalTenantName];
    return findKey(availableTenantsClone, () => true);
  }
  return findKey(availableTenantsClone, () => true);
}

/**
 * Return true if tenant parameter is a valid tenent.
 *
 * Note: empty string '' is valid, which means global tenant.
 *
 * @param tenant
 */
export function isValidTenant(tenant: string | undefined | null): boolean {
  return tenant !== undefined && tenant !== null;
}
