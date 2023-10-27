"use client";

import { ArrowPathIcon, ChevronLeftIcon } from "@heroicons/react/20/solid";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Snippet,
  useDisclosure,
} from "@nextui-org/react";
import { clsx } from "clsx";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

import { PlaceBidModal } from "./place-bid-modal";

import { PageHeading } from "@/components/page-heading";
import {
  useAuctionTokenBalanceOf,
  useAuctionTokenName,
  useAuctionTokenSymbol,
  useDutchAuctionDistributeTokens,
  useDutchAuctionGetAuctionEnded,
  useDutchAuctionGetClearingPrice,
  useDutchAuctionGetCommitmentByBidder,
  useDutchAuctionGetCurrentPrice,
  useDutchAuctionGetDuration,
  useDutchAuctionGetRemainingSupply,
  useDutchAuctionGetReservedPrice,
  useDutchAuctionGetStartPrice,
  useDutchAuctionGetStartTime,
  useDutchAuctionGetToken,
  useDutchAuctionGetTokensDistributed,
  useDutchAuctionGetTotalSupply,
} from "@/generated";
import { useCountdown } from "@/hooks/use-countdown";
import { formatCountdown } from "@/utils/countdown";

export default function AuctionPage() {
  // Get contract address
  const { contractAddress } = useParams();

  // Get current wallet
  const { address } = useAccount();

  // Get token metadata
  const { data: tokenAddress } = useDutchAuctionGetToken({
    address: contractAddress as `0x${string}`,
  });

  const { data: tokenName } = useAuctionTokenName({
    address: tokenAddress,
  });

  const { data: tokenSymbol } = useAuctionTokenSymbol({
    address: tokenAddress,
  });

  // Static
  const { data: totalSupply } = useDutchAuctionGetTotalSupply({
    address: contractAddress as `0x${string}`,
  });

  const { data: startPrice } = useDutchAuctionGetStartPrice({
    address: contractAddress as `0x${string}`,
  });

  const { data: reservedPrice } = useDutchAuctionGetReservedPrice({
    address: contractAddress as `0x${string}`,
  });

  const { data: startTime } = useDutchAuctionGetStartTime({
    address: contractAddress as `0x${string}`,
  });

  const startTimeDate = useMemo(() => {
    return new Date(Number(startTime) * 1000);
  }, [startTime]);

  const { data: duration } = useDutchAuctionGetDuration({
    address: contractAddress as `0x${string}`,
  });

  // Needs refetch
  const { data: myTokens, refetch: balanceOfRefetch } =
    useAuctionTokenBalanceOf({
      args: [address!],
      address: tokenAddress,
      enabled: Boolean(address),
    });

  const { data: tokensDistributed, refetch: tokensDistributedRefetch } =
    useDutchAuctionGetTokensDistributed({
      address: contractAddress as `0x${string}`,
    });

  const { data: commitmentByBidder, refetch: commitmentByBidderRefetch } =
    useDutchAuctionGetCommitmentByBidder({
      args: [address!],
      address: contractAddress as `0x${string}`,
      enabled: Boolean(address),
    });

  const { data: currentPrice, refetch: currentPriceRefetch } =
    useDutchAuctionGetCurrentPrice({
      address: contractAddress as `0x${string}`,
    });

  const { data: auctionEnded, refetch: auctionEndedRefetch } =
    useDutchAuctionGetAuctionEnded({
      address: contractAddress as `0x${string}`,
    });

  const { data: clearingPrice, refetch: clearingPriceRefetch } =
    useDutchAuctionGetClearingPrice({
      address: contractAddress as `0x${string}`,
      enabled: auctionEnded,
    });

  const { data: remainingSupply, refetch: RemainingSupplyRefetch } =
    useDutchAuctionGetRemainingSupply({
      address: contractAddress as `0x${string}`,
    });

  // Distribute tokens function
  const { write: distributeTokens } = useDutchAuctionDistributeTokens({
    address: contractAddress as `0x${string}`,
    onSuccess() {
      toast.success("Tokens distributed successfully");
    },
  });

  // Countdown
  const { minutes, seconds } = useCountdown(startTimeDate, Number(duration));

  // Modal control
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Refetch
  const refetch = () => {
    balanceOfRefetch();
    RemainingSupplyRefetch();
    tokensDistributedRefetch();
    commitmentByBidderRefetch();
    currentPriceRefetch();
    auctionEndedRefetch();
    clearingPriceRefetch();
    RemainingSupplyRefetch();
  };

  return (
    <div className="space-y-10">
      <div className="space-y-5">
        <nav aria-label="Back">
          <Link
            href={`/auctions`}
            className="text-foreground-500 hover:text-foreground-700 flex items-center text-sm font-medium"
          >
            <ChevronLeftIcon
              className="text-foreground-400 -ml-1 mr-1 h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            />
            Browse Auctions
          </Link>
        </nav>
        <PageHeading
          primaryAction={
            auctionEnded ? (
              <Button
                onClick={() => distributeTokens()}
                isDisabled={!auctionEnded || tokensDistributed}
              >
                {tokensDistributed ? "Tokens Distributed" : "Distribute Tokens"}
              </Button>
            ) : (
              contractAddress && (
                <PlaceBidModal
                  contractAddress={contractAddress as `0x${string}`}
                  isOpen={isOpen}
                  onOpen={onOpen}
                  onOpenChange={onOpenChange}
                />
              )
            )
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
          {tokenName} ({tokenSymbol})
        </PageHeading>
        <div className="flex gap-2">
          {auctionEnded ? (
            <Chip color="success" variant="flat">
              Auction Ended
            </Chip>
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
      <Divider />
      <AuctionDetailsSection
        items={[
          {
            name: "Start Time",
            element: startTimeDate.toLocaleString(),
          },
          {
            name: "Duration",
            element: `${Number(duration) / 60} minutes`,
          },
          {
            name: "Auction Address",
            element: (
              <Snippet hideSymbol color="secondary" variant="flat">
                <div className="w-52">
                  <p className="truncate">{contractAddress}</p>
                </div>
              </Snippet>
            ),
          },
          {
            name: "Token Address",
            element: (
              <Snippet hideSymbol color="secondary" variant="flat">
                <div className="w-52">
                  <p className="truncate">{tokenAddress}</p>
                </div>
              </Snippet>
            ),
          },
          {
            name: "My Commitment",
            element:
              commitmentByBidder !== undefined &&
              `${(+formatEther(commitmentByBidder)).toFixed(4)} ethers`,
          },
          {
            name:
              auctionEnded && tokensDistributed
                ? "Tokens Received"
                : "Tokens to receive (estimated)",
            element:
              auctionEnded && tokensDistributed
                ? myTokens !== undefined &&
                  `${(+formatEther(myTokens)).toFixed(4)} tokens`
                : auctionEnded
                ? commitmentByBidder !== undefined &&
                  clearingPrice !== undefined &&
                  `${Number(commitmentByBidder / clearingPrice).toFixed(
                    4,
                  )} tokens`
                : commitmentByBidder !== undefined &&
                  currentPrice !== undefined &&
                  `${Number(commitmentByBidder / currentPrice).toFixed(
                    4,
                  )} tokens`,
          },
        ]}
      />
      <Divider />
      <div className="space-y-5">
        {startPrice !== undefined &&
          currentPrice !== undefined &&
          reservedPrice !== undefined && (
            <StatCardsSection
              title="Auction Price"
              items={[
                {
                  name: "Start Price",
                  stat: startPrice,
                  unit: "ethers/token",
                },
                auctionEnded && clearingPrice !== undefined
                  ? {
                      name: "Clearing Price",
                      stat: clearingPrice,
                      unit: "ethers/token",
                      highlighted: true,
                    }
                  : {
                      name: "Current Price",
                      stat: currentPrice,
                      unit: "ethers/token",
                      highlighted: true,
                    },
                {
                  name: "Reserved Price",
                  stat: reservedPrice,
                  unit: "ethers/token",
                },
              ]}
            />
          )}
        {totalSupply !== undefined && remainingSupply !== undefined && (
          <StatCardsSection
            title="Auction Supply"
            items={[
              {
                name: "Total Supply",
                stat: totalSupply,
                unit: "tokens",
              },
              {
                name:
                  auctionEnded && tokensDistributed
                    ? "Supply Burned"
                    : auctionEnded
                    ? "Supply to be burned"
                    : "Remaining Supply",
                stat: remainingSupply,
                unit: "tokens",
                highlighted: true,
              },
              {
                name: tokensDistributed
                  ? "Supply Distributed"
                  : "Supply to be distributed",
                stat: totalSupply - remainingSupply,
                unit: "tokens",
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

export function AuctionDetailsSection({
  items,
}: {
  items: {
    name: string;
    element: React.ReactNode;
  }[];
}) {
  return (
    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.name} className="px-4 sm:col-span-1 sm:px-0">
          <dt className="text-foreground-600 leading-6">{item.name}</dt>
          <dd className="mt-2 text-lg font-medium leading-6 sm:mt-2">
            {item.element}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function StatCardsSection({
  title,
  items,
}: {
  title: string;
  items: {
    name: string;
    stat: bigint;
    unit: string;
    highlighted?: boolean;
  }[];
}) {
  return (
    <div className="space-y-2">
      <p>{title}</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {items.map((item) => (
          <StatCard key={item.name} {...item} />
        ))}
      </div>
    </div>
  );
}

export function StatCard({
  name,
  stat,
  unit,
  highlighted,
}: {
  name: string;
  stat: bigint;
  unit: string;
  highlighted?: boolean;
}) {
  return (
    <Card>
      <CardBody className={clsx(highlighted ? "bg-secondary-400" : "")}>
        <p className="text-foreground-600 text-sm font-medium leading-6">
          {name}
        </p>
        <p className="mt-2 flex items-baseline gap-x-2">
          <span className="text-xl font-semibold tracking-tight">
            {(+formatEther(stat)).toFixed(4)}
          </span>
          <span className="text-foreground-600 text-sm">{unit}</span>
        </p>
      </CardBody>
    </Card>
  );
}
