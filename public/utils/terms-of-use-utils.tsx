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

import React from 'react';

const termsOfUseText: string = `
These terms apply to your access and use of the OpenSearch Playground. The OpenSearch Playground provides an interactive OpenSearch Dashboards experience, 
which may include capabilities and functionality that are not yet launched as part of the OpenSearch software. The OpenSearch Playground is made available 
to you for evaluation and feedback purposes only. We recommend that no sensitive or personal data should be provided by the user. Use of the OpenSearch 
Playground is subject to the Privacy Notice and, in addition, OpenSearch will own and may use and evaluate all content provided by the user in the 
OpenSearch Playground. 
\n
OpenSearch Playground may incorporate one or more machine learning models. Output generated by a machine learning model is probabilistic, and generative AI 
may produce inaccurate or inappropriate content. The OpenSearch Playground relies on synthetic datasets and you should not rely on factual assertions output 
to make consequential decisions. Consequential decisions include those impacting a person’s fundamental rights, health, or safety (e.g., medical diagnosis, judicial 
proceedings, access to critical benefits like housing or government benefits, opportunities like education, decisions to hire or terminate employees, or access to 
lending/credit, and providing legal, financial, or medical advice). Machine learning models provided in the OpenSearch Playground cannot dynamically retrieve 
information, and outputs may not account for events or changes to underlying facts occurring after a machine learning model is trained. 
`;

export const termsParagraphs = termsOfUseText
  .trim()
  .split('\n\n')
  .map((paragraph, index, array) => (
    <p
      key={`terms-paragraph-${index}`}
      style={{ lineHeight: '1.3', marginBottom: index === array.length - 1 ? '0' : '20px' }}
    >
      {paragraph.trim()}
    </p>
  ));
