import {
  useContractRead,
  UseContractReadConfig,
  useContractWrite,
  UseContractWriteConfig,
  usePrepareContractWrite,
  UsePrepareContractWriteConfig,
  useContractEvent,
  UseContractEventConfig,
} from 'wagmi'
import {
  ReadContractResult,
  WriteContractMode,
  PrepareWriteContractResult,
} from 'wagmi/actions'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// auctionFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const auctionFactoryABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'auction',
        internalType: 'contract DutchAuction',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AuctionCreated',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'tokenName', internalType: 'string', type: 'string' },
      { name: 'tokenSymbol', internalType: 'string', type: 'string' },
      { name: 'totalSupply', internalType: 'uint256', type: 'uint256' },
      { name: 'startPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'reservedPrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createAuction',
    outputs: [
      { name: '', internalType: 'contract DutchAuction', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getAllAuctions',
    outputs: [
      { name: '', internalType: 'contract DutchAuction[]', type: 'address[]' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'creator', internalType: 'address', type: 'address' }],
    name: 'getAuctionsByCreator',
    outputs: [
      { name: '', internalType: 'contract DutchAuction[]', type: 'address[]' },
    ],
  },
] as const

export const auctionFactoryAddress =
  '0x060387d336c98C4A212Ca706A4464F391F2a74BB' as const

export const auctionFactoryConfig = {
  address: auctionFactoryAddress,
  abi: auctionFactoryABI,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// auctionToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const auctionTokenABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'preMint_', internalType: 'uint256', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// dutchAuction
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const dutchAuctionABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: 'tokenName', internalType: 'string', type: 'string' },
      { name: 'tokenSymbol', internalType: 'string', type: 'string' },
      { name: 'totalSupply', internalType: 'uint256', type: 'uint256' },
      { name: 'startPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'reservedPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'creator', internalType: 'address', type: 'address' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'distributeTokens',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getAuctionEnded',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getClearingPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'bidder', internalType: 'address', type: 'address' }],
    name: 'getCommitmentByBidder',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getCreator',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getCurrentPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [],
    name: 'getDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getRemainingSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getReservedPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getStartPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getStartTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getToken',
    outputs: [
      { name: '', internalType: 'contract AuctionToken', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getTokensDistributed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getTotalCommitment',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getTotalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [],
    name: 'placeBid',
    outputs: [],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionFactoryABI}__.
 */
export function useAuctionFactoryRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof auctionFactoryABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionFactoryABI, TFunctionName, TSelectData>,
    'abi' | 'address'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionFactoryABI,
    address: auctionFactoryAddress,
    ...config,
  } as UseContractReadConfig<
    typeof auctionFactoryABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionFactoryABI}__ and `functionName` set to `"getAllAuctions"`.
 */
export function useAuctionFactoryGetAllAuctions<
  TFunctionName extends 'getAllAuctions',
  TSelectData = ReadContractResult<typeof auctionFactoryABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionFactoryABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionFactoryABI,
    address: auctionFactoryAddress,
    functionName: 'getAllAuctions',
    ...config,
  } as UseContractReadConfig<
    typeof auctionFactoryABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionFactoryABI}__ and `functionName` set to `"getAuctionsByCreator"`.
 */
export function useAuctionFactoryGetAuctionsByCreator<
  TFunctionName extends 'getAuctionsByCreator',
  TSelectData = ReadContractResult<typeof auctionFactoryABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionFactoryABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionFactoryABI,
    address: auctionFactoryAddress,
    functionName: 'getAuctionsByCreator',
    ...config,
  } as UseContractReadConfig<
    typeof auctionFactoryABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link auctionFactoryABI}__.
 */
export function useAuctionFactoryWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof auctionFactoryABI,
          string
        >['request']['abi'],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<typeof auctionFactoryABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any,
) {
  return useContractWrite<typeof auctionFactoryABI, TFunctionName, TMode>({
    abi: auctionFactoryABI,
    address: auctionFactoryAddress,
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link auctionFactoryABI}__ and `functionName` set to `"createAuction"`.
 */
export function useAuctionFactoryCreateAuction<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof auctionFactoryABI,
          'createAuction'
        >['request']['abi'],
        'createAuction',
        TMode
      > & { functionName?: 'createAuction' }
    : UseContractWriteConfig<
        typeof auctionFactoryABI,
        'createAuction',
        TMode
      > & {
        abi?: never
        functionName?: 'createAuction'
      } = {} as any,
) {
  return useContractWrite<typeof auctionFactoryABI, 'createAuction', TMode>({
    abi: auctionFactoryABI,
    address: auctionFactoryAddress,
    functionName: 'createAuction',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link auctionFactoryABI}__.
 */
export function usePrepareAuctionFactoryWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof auctionFactoryABI, TFunctionName>,
    'abi' | 'address'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: auctionFactoryABI,
    address: auctionFactoryAddress,
    ...config,
  } as UsePrepareContractWriteConfig<typeof auctionFactoryABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link auctionFactoryABI}__ and `functionName` set to `"createAuction"`.
 */
export function usePrepareAuctionFactoryCreateAuction(
  config: Omit<
    UsePrepareContractWriteConfig<typeof auctionFactoryABI, 'createAuction'>,
    'abi' | 'address' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: auctionFactoryABI,
    address: auctionFactoryAddress,
    functionName: 'createAuction',
    ...config,
  } as UsePrepareContractWriteConfig<typeof auctionFactoryABI, 'createAuction'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link auctionFactoryABI}__.
 */
export function useAuctionFactoryEvent<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof auctionFactoryABI, TEventName>,
    'abi' | 'address'
  > = {} as any,
) {
  return useContractEvent({
    abi: auctionFactoryABI,
    address: auctionFactoryAddress,
    ...config,
  } as UseContractEventConfig<typeof auctionFactoryABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link auctionFactoryABI}__ and `eventName` set to `"AuctionCreated"`.
 */
export function useAuctionFactoryAuctionCreatedEvent(
  config: Omit<
    UseContractEventConfig<typeof auctionFactoryABI, 'AuctionCreated'>,
    'abi' | 'address' | 'eventName'
  > = {} as any,
) {
  return useContractEvent({
    abi: auctionFactoryABI,
    address: auctionFactoryAddress,
    eventName: 'AuctionCreated',
    ...config,
  } as UseContractEventConfig<typeof auctionFactoryABI, 'AuctionCreated'>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionTokenABI}__.
 */
export function useAuctionTokenRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof auctionTokenABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionTokenABI, TFunctionName, TSelectData>,
    'abi'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionTokenABI,
    ...config,
  } as UseContractReadConfig<
    typeof auctionTokenABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"allowance"`.
 */
export function useAuctionTokenAllowance<
  TFunctionName extends 'allowance',
  TSelectData = ReadContractResult<typeof auctionTokenABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionTokenABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionTokenABI,
    functionName: 'allowance',
    ...config,
  } as UseContractReadConfig<
    typeof auctionTokenABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"balanceOf"`.
 */
export function useAuctionTokenBalanceOf<
  TFunctionName extends 'balanceOf',
  TSelectData = ReadContractResult<typeof auctionTokenABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionTokenABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionTokenABI,
    functionName: 'balanceOf',
    ...config,
  } as UseContractReadConfig<
    typeof auctionTokenABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"decimals"`.
 */
export function useAuctionTokenDecimals<
  TFunctionName extends 'decimals',
  TSelectData = ReadContractResult<typeof auctionTokenABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionTokenABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionTokenABI,
    functionName: 'decimals',
    ...config,
  } as UseContractReadConfig<
    typeof auctionTokenABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"name"`.
 */
export function useAuctionTokenName<
  TFunctionName extends 'name',
  TSelectData = ReadContractResult<typeof auctionTokenABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionTokenABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionTokenABI,
    functionName: 'name',
    ...config,
  } as UseContractReadConfig<
    typeof auctionTokenABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"symbol"`.
 */
export function useAuctionTokenSymbol<
  TFunctionName extends 'symbol',
  TSelectData = ReadContractResult<typeof auctionTokenABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionTokenABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionTokenABI,
    functionName: 'symbol',
    ...config,
  } as UseContractReadConfig<
    typeof auctionTokenABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"totalSupply"`.
 */
export function useAuctionTokenTotalSupply<
  TFunctionName extends 'totalSupply',
  TSelectData = ReadContractResult<typeof auctionTokenABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof auctionTokenABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: auctionTokenABI,
    functionName: 'totalSupply',
    ...config,
  } as UseContractReadConfig<
    typeof auctionTokenABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link auctionTokenABI}__.
 */
export function useAuctionTokenWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof auctionTokenABI,
          string
        >['request']['abi'],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<typeof auctionTokenABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any,
) {
  return useContractWrite<typeof auctionTokenABI, TFunctionName, TMode>({
    abi: auctionTokenABI,
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"approve"`.
 */
export function useAuctionTokenApprove<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof auctionTokenABI,
          'approve'
        >['request']['abi'],
        'approve',
        TMode
      > & { functionName?: 'approve' }
    : UseContractWriteConfig<typeof auctionTokenABI, 'approve', TMode> & {
        abi?: never
        functionName?: 'approve'
      } = {} as any,
) {
  return useContractWrite<typeof auctionTokenABI, 'approve', TMode>({
    abi: auctionTokenABI,
    functionName: 'approve',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"burn"`.
 */
export function useAuctionTokenBurn<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof auctionTokenABI,
          'burn'
        >['request']['abi'],
        'burn',
        TMode
      > & { functionName?: 'burn' }
    : UseContractWriteConfig<typeof auctionTokenABI, 'burn', TMode> & {
        abi?: never
        functionName?: 'burn'
      } = {} as any,
) {
  return useContractWrite<typeof auctionTokenABI, 'burn', TMode>({
    abi: auctionTokenABI,
    functionName: 'burn',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"transfer"`.
 */
export function useAuctionTokenTransfer<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof auctionTokenABI,
          'transfer'
        >['request']['abi'],
        'transfer',
        TMode
      > & { functionName?: 'transfer' }
    : UseContractWriteConfig<typeof auctionTokenABI, 'transfer', TMode> & {
        abi?: never
        functionName?: 'transfer'
      } = {} as any,
) {
  return useContractWrite<typeof auctionTokenABI, 'transfer', TMode>({
    abi: auctionTokenABI,
    functionName: 'transfer',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"transferFrom"`.
 */
export function useAuctionTokenTransferFrom<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof auctionTokenABI,
          'transferFrom'
        >['request']['abi'],
        'transferFrom',
        TMode
      > & { functionName?: 'transferFrom' }
    : UseContractWriteConfig<typeof auctionTokenABI, 'transferFrom', TMode> & {
        abi?: never
        functionName?: 'transferFrom'
      } = {} as any,
) {
  return useContractWrite<typeof auctionTokenABI, 'transferFrom', TMode>({
    abi: auctionTokenABI,
    functionName: 'transferFrom',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link auctionTokenABI}__.
 */
export function usePrepareAuctionTokenWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof auctionTokenABI, TFunctionName>,
    'abi'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: auctionTokenABI,
    ...config,
  } as UsePrepareContractWriteConfig<typeof auctionTokenABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"approve"`.
 */
export function usePrepareAuctionTokenApprove(
  config: Omit<
    UsePrepareContractWriteConfig<typeof auctionTokenABI, 'approve'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: auctionTokenABI,
    functionName: 'approve',
    ...config,
  } as UsePrepareContractWriteConfig<typeof auctionTokenABI, 'approve'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"burn"`.
 */
export function usePrepareAuctionTokenBurn(
  config: Omit<
    UsePrepareContractWriteConfig<typeof auctionTokenABI, 'burn'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: auctionTokenABI,
    functionName: 'burn',
    ...config,
  } as UsePrepareContractWriteConfig<typeof auctionTokenABI, 'burn'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"transfer"`.
 */
export function usePrepareAuctionTokenTransfer(
  config: Omit<
    UsePrepareContractWriteConfig<typeof auctionTokenABI, 'transfer'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: auctionTokenABI,
    functionName: 'transfer',
    ...config,
  } as UsePrepareContractWriteConfig<typeof auctionTokenABI, 'transfer'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link auctionTokenABI}__ and `functionName` set to `"transferFrom"`.
 */
export function usePrepareAuctionTokenTransferFrom(
  config: Omit<
    UsePrepareContractWriteConfig<typeof auctionTokenABI, 'transferFrom'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: auctionTokenABI,
    functionName: 'transferFrom',
    ...config,
  } as UsePrepareContractWriteConfig<typeof auctionTokenABI, 'transferFrom'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link auctionTokenABI}__.
 */
export function useAuctionTokenEvent<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof auctionTokenABI, TEventName>,
    'abi'
  > = {} as any,
) {
  return useContractEvent({
    abi: auctionTokenABI,
    ...config,
  } as UseContractEventConfig<typeof auctionTokenABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link auctionTokenABI}__ and `eventName` set to `"Approval"`.
 */
export function useAuctionTokenApprovalEvent(
  config: Omit<
    UseContractEventConfig<typeof auctionTokenABI, 'Approval'>,
    'abi' | 'eventName'
  > = {} as any,
) {
  return useContractEvent({
    abi: auctionTokenABI,
    eventName: 'Approval',
    ...config,
  } as UseContractEventConfig<typeof auctionTokenABI, 'Approval'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link auctionTokenABI}__ and `eventName` set to `"Transfer"`.
 */
export function useAuctionTokenTransferEvent(
  config: Omit<
    UseContractEventConfig<typeof auctionTokenABI, 'Transfer'>,
    'abi' | 'eventName'
  > = {} as any,
) {
  return useContractEvent({
    abi: auctionTokenABI,
    eventName: 'Transfer',
    ...config,
  } as UseContractEventConfig<typeof auctionTokenABI, 'Transfer'>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__.
 */
export function useDutchAuctionRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getAuctionEnded"`.
 */
export function useDutchAuctionGetAuctionEnded<
  TFunctionName extends 'getAuctionEnded',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getAuctionEnded',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getClearingPrice"`.
 */
export function useDutchAuctionGetClearingPrice<
  TFunctionName extends 'getClearingPrice',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getClearingPrice',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getCommitmentByBidder"`.
 */
export function useDutchAuctionGetCommitmentByBidder<
  TFunctionName extends 'getCommitmentByBidder',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getCommitmentByBidder',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getCreator"`.
 */
export function useDutchAuctionGetCreator<
  TFunctionName extends 'getCreator',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getCreator',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getCurrentPrice"`.
 */
export function useDutchAuctionGetCurrentPrice<
  TFunctionName extends 'getCurrentPrice',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getCurrentPrice',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getDuration"`.
 */
export function useDutchAuctionGetDuration<
  TFunctionName extends 'getDuration',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getDuration',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getRemainingSupply"`.
 */
export function useDutchAuctionGetRemainingSupply<
  TFunctionName extends 'getRemainingSupply',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getRemainingSupply',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getReservedPrice"`.
 */
export function useDutchAuctionGetReservedPrice<
  TFunctionName extends 'getReservedPrice',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getReservedPrice',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getStartPrice"`.
 */
export function useDutchAuctionGetStartPrice<
  TFunctionName extends 'getStartPrice',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getStartPrice',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getStartTime"`.
 */
export function useDutchAuctionGetStartTime<
  TFunctionName extends 'getStartTime',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getStartTime',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getToken"`.
 */
export function useDutchAuctionGetToken<
  TFunctionName extends 'getToken',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getToken',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getTokensDistributed"`.
 */
export function useDutchAuctionGetTokensDistributed<
  TFunctionName extends 'getTokensDistributed',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getTokensDistributed',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getTotalCommitment"`.
 */
export function useDutchAuctionGetTotalCommitment<
  TFunctionName extends 'getTotalCommitment',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getTotalCommitment',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"getTotalSupply"`.
 */
export function useDutchAuctionGetTotalSupply<
  TFunctionName extends 'getTotalSupply',
  TSelectData = ReadContractResult<typeof dutchAuctionABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof dutchAuctionABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: dutchAuctionABI,
    functionName: 'getTotalSupply',
    ...config,
  } as UseContractReadConfig<
    typeof dutchAuctionABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link dutchAuctionABI}__.
 */
export function useDutchAuctionWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof dutchAuctionABI,
          string
        >['request']['abi'],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<typeof dutchAuctionABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any,
) {
  return useContractWrite<typeof dutchAuctionABI, TFunctionName, TMode>({
    abi: dutchAuctionABI,
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"distributeTokens"`.
 */
export function useDutchAuctionDistributeTokens<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof dutchAuctionABI,
          'distributeTokens'
        >['request']['abi'],
        'distributeTokens',
        TMode
      > & { functionName?: 'distributeTokens' }
    : UseContractWriteConfig<
        typeof dutchAuctionABI,
        'distributeTokens',
        TMode
      > & {
        abi?: never
        functionName?: 'distributeTokens'
      } = {} as any,
) {
  return useContractWrite<typeof dutchAuctionABI, 'distributeTokens', TMode>({
    abi: dutchAuctionABI,
    functionName: 'distributeTokens',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"placeBid"`.
 */
export function useDutchAuctionPlaceBid<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof dutchAuctionABI,
          'placeBid'
        >['request']['abi'],
        'placeBid',
        TMode
      > & { functionName?: 'placeBid' }
    : UseContractWriteConfig<typeof dutchAuctionABI, 'placeBid', TMode> & {
        abi?: never
        functionName?: 'placeBid'
      } = {} as any,
) {
  return useContractWrite<typeof dutchAuctionABI, 'placeBid', TMode>({
    abi: dutchAuctionABI,
    functionName: 'placeBid',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link dutchAuctionABI}__.
 */
export function usePrepareDutchAuctionWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof dutchAuctionABI, TFunctionName>,
    'abi'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: dutchAuctionABI,
    ...config,
  } as UsePrepareContractWriteConfig<typeof dutchAuctionABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"distributeTokens"`.
 */
export function usePrepareDutchAuctionDistributeTokens(
  config: Omit<
    UsePrepareContractWriteConfig<typeof dutchAuctionABI, 'distributeTokens'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: dutchAuctionABI,
    functionName: 'distributeTokens',
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof dutchAuctionABI,
    'distributeTokens'
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link dutchAuctionABI}__ and `functionName` set to `"placeBid"`.
 */
export function usePrepareDutchAuctionPlaceBid(
  config: Omit<
    UsePrepareContractWriteConfig<typeof dutchAuctionABI, 'placeBid'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: dutchAuctionABI,
    functionName: 'placeBid',
    ...config,
  } as UsePrepareContractWriteConfig<typeof dutchAuctionABI, 'placeBid'>)
}
