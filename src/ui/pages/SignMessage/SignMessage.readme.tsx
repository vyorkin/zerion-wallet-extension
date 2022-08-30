import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { WindowSize } from 'src/ui-lab/components/WindowSize';
import type { Readme } from 'src/ui-lab/types';
import { SignMessage } from './SignMessage';

const samples: Array<{ message: string } | { typedData: string }> = [
  { message: 'Hello, world' },
  {
    typedData:
      '{"types":{"SetMasterContractApproval":[{"name":"warning","type":"string"},{"name":"user","type":"address"},{"name":"masterContract","type":"address"},{"name":"approved","type":"bool"},{"name":"nonce","type":"uint256"}],"EIP712Domain":[{"name":"name","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}]},"domain":{"name":"BentoBox V1","chainId":"137","verifyingContract":"0x0319000133d3ada02600f0875d2cf03d442c3367"},"primaryType":"SetMasterContractApproval","message":{"warning":"Give FULL access to funds in (and approved to) BentoBox?","user":"0x42b9df65b219b3dd36ff330a4dd8f327a6ada990","masterContract":"0xc5017be80b4446988e8686168396289a9a62668e","approved":true,"nonce":"0"}}',
  },
];

export const readme: Readme = {
  name: 'SignMessage',
  description: null,
  component: () => (
    <div
      style={{
        display: 'grid',
        gridGap: 12,
        gridTemplateColumns: 'repeat(5, minmax(290px, 700px))',
        overflowX: 'auto',
      }}
    >
      {samples.map((sample, index) => (
        <MemoryRouter
          key={index}
          initialEntries={[
            `/signMessage?${new URLSearchParams({
              origin: 'https://app.zerion.io',
              windowId: String(index),
              ...sample,
            })}`,
          ]}
        >
          <WindowSize>
            <SignMessage />
          </WindowSize>
        </MemoryRouter>
      ))}
    </div>
  ),
};