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

import { useAuctionFactoryCreateAuction } from "@/generated";

const createAuctionSchema = z.object({
  name: z.string().min(1),
  symbol: z.string().min(1),
  totalSupply: z.number().int().positive(),
  startPrice: z.number().positive(),
  reservedPrice: z.number().positive(),
});

export function CreateAuctionModal({
  isOpen,
  onOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<z.infer<typeof createAuctionSchema>>({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
      name: "",
      symbol: "",
      totalSupply: 1000,
      startPrice: 1,
      reservedPrice: 0.5,
    },
  });

  const { write: createAuction } = useAuctionFactoryCreateAuction({
    onSuccess() {
      toast.success("Auction created successfully");
      reset();
    },
  });

  return (
    <>
      <Button color="secondary" onClick={onOpen}>
        Create Auction
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={handleSubmit((input) => {
                createAuction({
                  args: [
                    input.name,
                    input.symbol,
                    parseEther(String(input.totalSupply)),
                    parseEther(String(input.startPrice)),
                    parseEther(String(input.reservedPrice)),
                  ],
                });
              })}
            >
              <ModalHeader className="flex flex-col gap-1">
                Place Bid
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Token Name"
                  labelPlacement="outside"
                  placeholder="Token name"
                  errorMessage={errors.name?.message && errors.name.message}
                  {...register("name")}
                />
                <Input
                  label="Token Symbol"
                  labelPlacement="outside"
                  placeholder="Token symbol"
                  errorMessage={errors.symbol?.message && errors.symbol.message}
                  {...register("symbol")}
                />
                <Input
                  type="number"
                  label="Total Supply"
                  labelPlacement="outside"
                  placeholder="1000"
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">
                        tokens
                      </span>
                    </div>
                  }
                  errorMessage={
                    errors.totalSupply?.message && errors.totalSupply.message
                  }
                  {...register("totalSupply", {
                    valueAsNumber: true,
                  })}
                />
                <Input
                  type="number"
                  step="any"
                  label="Start Price"
                  labelPlacement="outside"
                  placeholder="1"
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">
                        ethers
                      </span>
                    </div>
                  }
                  errorMessage={
                    errors.startPrice?.message && errors.startPrice.message
                  }
                  {...register("startPrice", {
                    valueAsNumber: true,
                  })}
                />
                <Input
                  type="number"
                  step="any"
                  label="Reserved Price"
                  labelPlacement="outside"
                  placeholder="0.5"
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">
                        ethers
                      </span>
                    </div>
                  }
                  errorMessage={
                    errors.reservedPrice?.message &&
                    errors.reservedPrice.message
                  }
                  {...register("reservedPrice", {
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
                  Create Auction
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
