import React, { useState } from 'react';
import { Button, Input, Card, useEvent, JSONView } from 'tushan';
import { authHTTPClient } from '../auth';

export const OrderPage = React.memo(() => {
  const [text, setText] = useState('');
  const [json, setJson] = useState(null);

  const handleClick = useEvent(async () => {
    if (!text) {
      return;
    }

    const res = await authHTTPClient(`/api/fetchOrderInfo?orderId=${text}`);
    setJson(res.json);
  });

  return (
    <Card>
      <Input
        placeholder="please input order id, for example: MQVN4BH1NX"
        style={{ marginBottom: 10 }}
        value={text}
        onChange={(text) => setText(text)}
      />
      <Button onClick={handleClick}>Query</Button>

      {json && <JSONView data={json} />}
    </Card>
  );
});
OrderPage.displayName = 'OrderPage';
