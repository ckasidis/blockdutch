"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import { z } from "zod";

import { useDutchAuctionPlaceBid } from "@/generated";

const placeBidSchema = z.object({
  commitment: z
    .number()
    .positive()
    .refine(
      (value) => {
        try {
          parseEther(String(value));
          return true;
        } catch (e) {
          return false;
        }
      },
      {
        message: "Error parsing ether",
      },
    ),
});

export function PlaceBidModal({
  contractAddress,
  currentPrice,
  auctionEnded,
  isOpen,
  refetch,
  onOpen,
  onOpenChange,
}: {
  contractAddress: `0x${string}`;
  currentPrice: bigint;
  auctionEnded: boolean;
  remainingSupply: bigint;
  isOpen: boolean;
  refetch: () => void;
  onOpen: () => void;
  onOpenChange: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<z.infer<typeof placeBidSchema>>({
    resolver: zodResolver(placeBidSchema),
    defaultValues: {
      commitment: 0,
    },
  });

  const { write: placeBid } = useDutchAuctionPlaceBid({
    address: contractAddress,
    onSuccess() {
      toast.success("Placed bid successfully");
      reset();
    },
  });

  return (
    <>
      <Button color="secondary" onClick={onOpen}>
        Place Bid
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <form
                onSubmit={handleSubmit((input) => {
                  placeBid({
                    value: parseEther(String(input.commitment)),
                  });
                })}
              >
                <ModalHeader className="flex flex-col gap-1">
                  Place Bid
                </ModalHeader>
                <ModalBody>
                  <Input
                    type="number"
                    step="any"
                    label="Commitment"
                    labelPlacement="outside"
                    placeholder="0"
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">
                          ethers
                        </span>
                      </div>
                    }
                    errorMessage={
                      errors.commitment?.message && errors.commitment.message
                    }
                    description={
                      auctionEnded
                        ? "Auction has ended"
                        : currentPrice !== undefined &&
                          ` Estimated tokens to receive = ${Number(
                            getValues("commitment") /
                              +formatEther(currentPrice),
                          ).toFixed(4)} tokens`
                    }
                    {...register("commitment", {
                      valueAsNumber: true,
                    })}
                  />
                </ModalBody>
                <ModalFooter className="flex-col justify-between gap-2 sm:flex-row">
                  <Button
                    type="button"
                    onClick={() => refetch()}
                    startContent={<ArrowPathIcon className="h-4 w-4" />}
                    variant="light"
                  >
                    Refresh
                  </Button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      onClick={onClose}
                      color="danger"
                      variant="light"
                    >
                      Close
                    </Button>
                    <Button
                      type="submit"
                      isDisabled={!isValid}
                      isLoading={isSubmitting}
                      color="secondary"
                    >
                      Place Bid
                    </Button>
                  </div>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
