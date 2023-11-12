"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { CreateAuctionModal } from "@/components/create-auction-modal";
import { PageHeading } from "@/components/page-heading";
import {
  useAuctionFactoryGetAuctionsByCreator,
  useAuctionTokenName,
  useAuctionTokenSymbol,
  useDutchAuctionGetAuctionEnded,
  useDutchAuctionGetDuration,
  useDutchAuctionGetStartTime,
  useDutchAuctionGetToken,
  useDutchAuctionGetTokensDistributed,
} from "@/generated";
import { useCountdown } from "@/hooks/use-countdown";
import { formatCountdown } from "@/lib/utils/countdown";

export default function MyAuctionsPage() {
  const [showEnded, setShowEnded] = useState(false);

  const { address } = useAccount();

  const { data, refetch } = useAuctionFactoryGetAuctionsByCreator({
    args: [address as `0x{string}`],
  });

  // Modal Control
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="space-y-5">
      <PageHeading
        primaryAction={
          <CreateAuctionModal
            isOpen={isOpen}
            onOpen={onOpen}
            onOpenChange={onOpenChange}
          />
        }
        secondaryAction={
          <Button
            onClick={() => refetch()}
            startContent={<ArrowPathIcon className="h-4 w-4" />}
            variant="light"
          >
            Refresh
          </Button>
        }
      >
        My Auctions
      </PageHeading>
      <Checkbox isSelected={showEnded} onValueChange={setShowEnded}>
        Show ended auctions
      </Checkbox>
      <ul className="space-y-6">
        {data !== undefined && data.length > 0 ? (
          data
            .toReversed()
            .map((address) => (
              <AuctionCard
                key={address}
                contractAddress={address}
                showEnded={showEnded}
              />
            ))
        ) : (
          <Card>
            <CardBody>No auctions found</CardBody>
          </Card>
        )}
      </ul>
    </div>
  );
}

function AuctionCard({
  contractAddress,
  showEnded,
}: {
  contractAddress: `0x${string}`;
  showEnded: boolean;
}) {
  // Static data
  const { data: startTime } = useDutchAuctionGetStartTime({
    address: contractAddress,
  });
  const startTimeDate = useMemo(() => {
    return new Date(Number(startTime) * 1000);
  }, [startTime]);
  const { data: duration } = useDutchAuctionGetDuration({
    address: contractAddress,
  });

  // Dynamic data - Needs refetch
  const { data: tokensDistributed } = useDutchAuctionGetTokensDistributed({
    address: contractAddress,
  });
  const { data: auctionEnded } = useDutchAuctionGetAuctionEnded({
    address: contractAddress,
  });

  // Countdown
  const { minutes, seconds } = useCountdown(startTimeDate, Number(duration));

  return (
    (showEnded || !auctionEnded) && (
      <Card as="li" key={contractAddress}>
        <CardHeader>
          <Link
            href={`/auctions/${contractAddress}`}
            className="text-foreground-500 truncate text-sm"
          >
            {contractAddress}
          </Link>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <TokenMetadata contractAddress={contractAddress} />
            <div className="flex gap-2">
              {auctionEnded ? (
                <>
                  <Chip color="success" variant="flat" size="sm">
                    Auction Ended
                  </Chip>
                  {tokensDistributed && (
                    <Chip variant="flat" size="sm">
                      Tokens Distributed
                    </Chip>
                  )}
                </>
              ) : (
                <>
                  <Chip color="warning" variant="flat">
                    Auction On-going
                  </Chip>
                  <Chip variant="flat">
                    {formatCountdown({
                      minutes,
                      seconds,
                    })}
                  </Chip>
                </>
              )}
            </div>
          </div>
        </CardBody>
        <Divider />
        <CardFooter>
          <Button
            as={Link}
            href={`/auctions/${contractAddress}`}
            color="secondary"
            variant="light"
            size="sm"
          >
            View Auction
          </Button>
        </CardFooter>
      </Card>
    )
  );
}

function TokenMetadata({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) {
  // get token metadata
  const { data: tokenAddress } = useDutchAuctionGetToken({
    address: contractAddress as `0x${string}`,
  });

  const { data: tokenName } = useAuctionTokenName({
    address: tokenAddress,
  });
  const { data: tokenSymbol } = useAuctionTokenSymbol({
    address: tokenAddress,
  });

  return (
    <h3 className="text-2xl font-medium">
      {tokenName} ({tokenSymbol})
    </h3>
  );
}
