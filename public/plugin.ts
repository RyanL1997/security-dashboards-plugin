/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  Plugin,
  PluginInitializerContext,
} from '../../../src/core/public';
import {
  OpendistroSecurityPluginSetup,
  OpendistroSecurityPluginStart,
  AppPluginStartDependencies,
  ClientConfigType,
} from './types';
import { LOGIN_PAGE_URI, PLUGIN_NAME } from '../common';

export class OpendistroSecurityPlugin
  implements Plugin<OpendistroSecurityPluginSetup, OpendistroSecurityPluginStart> {
  // @ts-ignore : initializerContext not used
  constructor(private readonly initializerContext: PluginInitializerContext) {}

  public setup(core: CoreSetup): OpendistroSecurityPluginSetup {
    const config = this.initializerContext.config.get<ClientConfigType>();
    core.application.register({
      id: PLUGIN_NAME,
      title: 'Security',
      order: 1,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import('./apps/configuration/configuration-app');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    core.application.register({
      id: 'login',
      title: 'Security',
      chromeless: true,
      appRoute: `${LOGIN_PAGE_URI}`,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import('./apps/login/login-app');
        // @ts-ignore depsStart not used.
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params, config.ui.basicauth.login);
      },
    });

    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart): OpendistroSecurityPluginStart {
    return {};
  }

  public stop() {}
}
