// src/routes/api/hello.js
export async function get(req) {
  return {
    status: 200,
    body: {
      message: 'Hello, world!'
    }
  };
}