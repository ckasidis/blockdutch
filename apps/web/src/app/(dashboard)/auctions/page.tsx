"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { useMemo } from "react";

import { CreateAuctionModal } from "./create-auction-modal";

import { PageHeading } from "@/components/page-heading";
import {
  useAuctionFactoryGetAllAuctions,
  useAuctionTokenName,
  useAuctionTokenSymbol,
  useDutchAuctionGetAuctionEnded,
  useDutchAuctionGetDuration,
  useDutchAuctionGetStartTime,
  useDutchAuctionGetToken,
  useDutchAuctionGetTokensDistributed,
} from "@/generated";
import { useCountdown } from "@/hooks/use-countdown";
import { formatCountdown } from "@/utils/countdown";

export default function AuctionPage() {
  const { data, refetch } = useAuctionFactoryGetAllAuctions();

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
        Browse Auctions
      </PageHeading>
      <ul className="space-y-6">
        {data?.toReversed().map((address) => (
          <Card as="li" key={address}>
            <CardHeader>
              <Link
                href={`/auctions/${address}`}
                className="text-foreground-500 truncate text-sm"
              >
                {address}
              </Link>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <TokenMetadata contractAddress={address} />
                <AuctionStatus contractAddress={address} />
              </div>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button
                as={Link}
                href={`/auctions/${address}`}
                color="secondary"
                variant="light"
                size="sm"
              >
                View Auction
              </Button>
            </CardFooter>
          </Card>
        ))}
      </ul>
    </div>
  );
}

export function AuctionStatus({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) {
  const { data: startTime } = useDutchAuctionGetStartTime({
    address: contractAddress as `0x${string}`,
  });

  const startTimeDate = useMemo(() => {
    return new Date(Number(startTime) * 1000);
  }, [startTime]);

  const { data: duration } = useDutchAuctionGetDuration({
    address: contractAddress as `0x${string}`,
  });

  const { data: tokensDistributed } = useDutchAuctionGetTokensDistributed({
    address: contractAddress as `0x${string}`,
  });

  const { data: auctionEnded } = useDutchAuctionGetAuctionEnded({
    address: contractAddress as `0x${string}`,
  });

  const { minutes, seconds } = useCountdown(startTimeDate, Number(duration));

  return (
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
  );
}

export function TokenMetadata({
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
