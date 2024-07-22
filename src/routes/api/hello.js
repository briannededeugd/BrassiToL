// src/routes/api/hello.js
export async function get() {
  return {
    status: 200,
    body: {
      message: "Hello, world!",
    },
  };
}

// Prev had get(hello)
