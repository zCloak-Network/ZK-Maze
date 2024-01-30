/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export const idlFactory = ({ IDL }: { IDL: any }) => {
  return IDL.Service({
    greet: IDL.Func([IDL.Text], [IDL.Text], []),
    public_key: IDL.Func(
      [],
      [
        IDL.Variant({
          Ok: IDL.Record({ public_key_hex: IDL.Text }),
          Err: IDL.Text,
        }),
      ],
      []
    ),
    zk_verify: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text],
      [IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
      []
    ),
  });
};
