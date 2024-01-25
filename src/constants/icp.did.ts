export const idlFactory = ({ IDL }) => {
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
