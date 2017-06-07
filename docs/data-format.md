# Data format

The data in the pending queue is stored with a uuid for the key, and an object with the request and response params as the value.

```json
{
  "dateCreated": 1496806628563,
  "request": {
    "headers": {
      "Content-Type": "application/json"
    },
    "method": "POST",
    "params": {
      "qs": "param"
    },
    "url": "http://myserver.com/endpoint/",
    "data": {
      "field_name_1": "User entered form data",
      "field_name_2": 2,
      "field_name_3": false
    }
  },
  "response": {
    "status": 400,
    "statusText": "400 Bad Request",
    "data": "response from server. could be anything."
  }
}

```
