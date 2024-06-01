import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import numbro from "numbro"
import React, { useCallback, useState } from "react"
import { Address } from "viem"
import { useAccount, useSignMessage } from "wagmi"
import { ProposalOption } from "~/dummy/proposalOptions"
import { Proposal } from "~/dummy/proposals"
import { Space } from "~/dummy/spaces"
import { Type } from "~/dummy/type"
import { shortenAddress } from "~/lib/shortenAddress"
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  List,
  SkeletonText,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "~/sushi-ui"

interface VoteModalProps {
  space: Space
  proposal: Proposal
  option: ProposalOption
  children: React.ReactNode
}

type EvmVote = {
  spaceId: number
  proposalId: number
  optionId: number
  address: Address
  signature: string
}

function EvmVote({
  space,
  proposal,
  option
}: {
  space: Space
  proposal: Proposal
  option: ProposalOption
}) {
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { refetchQueries } = useQueryClient()

  const { data: power, isLoading } = useQuery({
    queryKey: [space.id, proposal.id, address, "power"],
    queryFn: async () => {
      return 100
    },
    enabled: isConnected
  })

  const { mutate } = useMutation<void, Error, EvmVote>({
    mutationKey: [space.id, proposal.id, option.name, "vote"],
    mutationFn: async params => {
      console.log(params)
      return
    },
    onSuccess: () => {
      refetchQueries({
        exact: true,
        queryKey: ["votes-by-proposal", proposal.id]
      })
    }
  })

  const { signMessage } = useSignMessage({
    mutation: {
      onSuccess: signature => {
        mutate({
          spaceId: space.id,
          proposalId: proposal.id,
          optionId: option.id,
          address: address!,
          signature: signature
        })
      }
    }
  })

  const sign = useCallback(() => {
    signMessage({
      message: JSON.stringify({
        space: space.id,
        proposal: proposal.id,
        option: option.id,
        address: address!
      })
    })
  }, [address, option.id, proposal.id, signMessage, space.id])

  if (!isConnected)
    return (
      <Button fullWidth variant="outline" onClick={openConnectModal}>
        Connect Wallet
      </Button>
    )

  return (
    <div className="space-y-4">
      <List>
        <List.Control>
          <List.KeyValue title="Address">
            {shortenAddress(address!)}
          </List.KeyValue>
          <List.KeyValue title="Power">
            {isLoading ? <SkeletonText /> : numbro(power).format("0.00a")}
          </List.KeyValue>
        </List.Control>
      </List>
      <Button fullWidth variant="outline" onClick={sign}>
        Vote
      </Button>
    </div>
  )
}

function BtcVote() {
  return <div></div>
}

export function VoteModal({
  space,
  proposal,
  option,
  children
}: VoteModalProps) {
  const { connectModalOpen } = useConnectModal()
  const [tab, setTab] = useState<Type>(Type.EVM)

  return (
    <Dialog modal={!connectModalOpen}>
      <DialogTrigger className="w-full">{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vote</DialogTitle>
        </DialogHeader>
        <div className="pt-4 space-y-2">
          <List>
            <List.Control>
              <List.KeyValue flex title="Proposal">
                {proposal.title}
              </List.KeyValue>
              <List.KeyValue flex title="Option">
                {option.name}
              </List.KeyValue>
            </List.Control>
          </List>
          <Tabs
            value={tab}
            onValueChange={value => setTab(value as Type)}
            className="w-full space-y-2"
          >
            <TabsList className="!flex">
              <TabsTrigger className="flex flex-1" value={Type.EVM}>
                EVM
              </TabsTrigger>
              <TabsTrigger className="flex flex-1" value={Type.BTC}>
                BTC
              </TabsTrigger>
            </TabsList>
            <TabsContent className="!mt-0" value={Type.EVM}>
              <EvmVote space={space} proposal={proposal} option={option} />
            </TabsContent>
            <TabsContent value={Type.BTC}>
              <BtcVote />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
