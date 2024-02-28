export const PROGRAM_STRING = `proc.store_maze_info
mem_store.101
mem_store.102
push.0.0 movup.3 movup.3
mem_storew.103 dropw
push.0.0 movup.3 movup.3
mem_storew.104 dropw
mem_store.105
dup.0
mem_store.106
dup.0 push.0 gt
push.1 swap
while.true
    push.0.0 movup.5 movup.5
    push.200 dup.5 add mem_storew dropw add.1
    dup.1 dup.1 gte
end
drop drop
end

proc.check_start_point
swap
padw
mem_loadw.103
eqw
movdn.8 dropw dropw
mem_store.107
end

proc.read_new_step
adv_push.2 push.0.0 movup.2 movup.3
end

proc.check_step_consecutive
movup.4

dup.1 dup.1 dup.1 dup.1 gt
if.true
sub
else
swap sub
end

swap drop

movup.5 dup.3

dup.1 dup.1 dup.1 dup.1 gt
if.true
sub
else
swap sub
end
movup.3 add eq.1 mem_load.107 and mem_store.107 movup.6 movup.7 dropw
end

proc.check_absolute_value
dup.1 dup.1 dup.1 dup.1 gt
if.true
sub
else
swap sub
end
end

proc.check_step_not_on_wall
push.1 mem_load.106 dup.0 push.1 gte
while.true
    movdn.5 dup.0 push.200 add movdn.5 movdn.5 dupw movup.8 padw movup.4 mem_loadw eqw not
    movdn.8 dropw dropw mem_load.107 and mem_store.107 movup.5 movup.5 add.1 swap dup.1 dup.1 lte
end
drop drop
end

proc.check_step_is_end
padw mem_loadw.104 eqw movdn.4 dropw
end

proc.check_row_and_column
dup.1 dup.1 mem_load.101 mem_load.102 movup.3 gte movdn.2 lte and mem_load.107 and mem_store.107
end

begin
exec.store_maze_info
adv_push.2
exec.check_start_point
padw
mem_loadw.103 push.1 mem_store.108 mem_load.107
while.true
exec.read_new_step exec.check_row_and_column exec.check_step_not_on_wall exec.check_step_consecutive exec.check_step_is_end dup.0 mem_store.109 mem_load.107 not or not
mem_load.108 add.1 mem_store.108
end
dropw

mem_load.109 mem_load.107
and
assert
mem_load.108 mem_load.105 sub
eq.0
if.true
  push.1
else
  push.2
end
end
`;

export const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "canisterAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddr", type: "address" }],
    name: "checkUserAchievement",
    outputs: [
      {
        internalType: "enum zkMazeVerify.Achievement",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "setCanisterAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "programHash", type: "string" }],
    name: "setProgramHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "signature", type: "bytes" },
      { internalType: "string", name: "programhash", type: "string" },
      { internalType: "string", name: "publicinput", type: "string" },
      { internalType: "string[]", name: "output", type: "string[]" },
    ],
    name: "verifyECDSASignature",
    outputs: [
      {
        internalType: "enum zkMazeVerify.Achievement",
        name: "acheiventment",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const SBTABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "canisterAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddr", type: "address" }],
    name: "checkUserAchievement",
    outputs: [
      {
        internalType: "enum zkMazeVerify.Achievement",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "setCanisterAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "programHash", type: "string" }],
    name: "setProgramHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "signature", type: "bytes" },
      { internalType: "string", name: "programhash", type: "string" },
      { internalType: "string", name: "publicinput", type: "string" },
      { internalType: "string[]", name: "output", type: "string[]" },
    ],
    name: "verifyECDSASignature",
    outputs: [
      {
        internalType: "enum zkMazeVerify.Achievement",
        name: "acheiventment",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
