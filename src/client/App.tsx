import {
  Button,
  createTextField,
  jsonServerProvider,
  ListTable,
  Message,
  Resource,
  Tushan,
} from 'tushan';
import { appleTransactionFields } from './fields';
import { authHTTPClient, authProvider } from './auth';

const dataProvider = jsonServerProvider('/api', authHTTPClient);

function App() {
  return (
    <Tushan
      basename="/"
      header="Fxxk Apple IAP"
      footer="Provide by Tushan"
      dashboard={false}
      dataProvider={dataProvider}
      authProvider={authProvider}
    >
      <Resource
        name="appleTransaction"
        label="Apple Transaction"
        list={
          <>
            <Button
              type="primary"
              onClick={() =>
                fetch('/api/refresh', {
                  method: 'POST',
                })
                  .then((res) => {
                    if (res.status === 200) {
                      Message.info('Start refreshing...');
                    } else {
                      Message.error('Is busying.');
                    }
                  })
                  .catch(() => {
                    Message.error('Is busying.');
                  })
              }
            >
              Reload
            </Button>
            <ListTable
              fields={appleTransactionFields}
              filter={[
                createTextField('q', {
                  label: 'Search',
                }),
              ]}
              action={{ detail: true, export: true }}
            />
          </>
        }
      />
    </Tushan>
  );
}

export default App;
