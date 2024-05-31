import {
    createActor as createBackendActor,
    canisterId as backendCanisterId
  } from "../declarations/backend"
  
  export const makeActor = (canisterId: string, createActor: (canisterId: string, options: { agentOptions: { host: string } }) => any): any => {
    return createActor(canisterId, {
      agentOptions: {
        host: process.env.NEXT_PUBLIC_IC_HOST as string
      }
    })
  }
  
  export function makeBackendActor() {
    return makeActor('bkyz2-fmaaa-aaaaa-qaaaq-cai', createBackendActor)
  }
  