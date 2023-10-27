"use client";

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
import { parseEther } from "viem";
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
  isOpen,
  onOpen,
  onOpenChange,
}: {
  contractAddress: `0x${string}`;
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
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
                    {...register("commitment", {
                      valueAsNumber: true,
                    })}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    type="button"
                    color="danger"
                    variant="light"
                    onClick={onClose}
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
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
