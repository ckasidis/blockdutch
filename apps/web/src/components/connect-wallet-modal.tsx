"use client";

import { WalletIcon } from "@heroicons/react/20/solid";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import React from "react";
import { type BaseError } from "viem";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectWalletModal({
  isOpen,
  onOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
}) {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();

  return (
    <>
      <Button
        onClick={onOpen}
        color="primary"
        startContent={<WalletIcon className="h-4 w-4" />}
      >
        {isConnected ? (
          <span className="w-14 truncate sm:w-20">{address}</span>
        ) : (
          "Connect"
        )}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Connect your wallet
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col space-y-3">
                  {connectors.map((x) =>
                    x.ready && x.id === connector?.id ? (
                      <Button
                        key={x.id}
                        onClick={() => disconnect()}
                        color="danger"
                      >
                        Disconnect {connector?.name}
                      </Button>
                    ) : (
                      <Button
                        key={x.id}
                        onClick={() => connect({ connector: x })}
                        color="primary"
                      >
                        {isLoading && x.id === pendingConnector?.id
                          ? `${x.name} (connecting)`
                          : `Connect ${x.name}`}
                      </Button>
                    ),
                  )}
                  {error && <div>{(error as BaseError).shortMessage}</div>}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onClick={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
