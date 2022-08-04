# CodeCup Challenge XSS
[![Build](https://github.com/codecup-codeday/chal-xss/actions/workflows/docker-image.yml/badge.svg)](https://github.com/codecup-codeday/chal-xss/actions/workflows/docker-image.yml)
## A Node server capable of detecting an XSS attack

This is a CTF challenge that requires the user to exploit XSS to find the flag. Note that this essentially runs user provided code in NodeJS and should be treated with caution - running in a container is highly recommended.

### Build Docker Container

```shell
docker build -t codecup-codeday/chal-xss:latest .
```

### Environment Variables

`FLAG` - Required, the flag the user will find.
`PORT` - Not Required, the port the app runs on - defaults to `8080`.
`SEED` - Not Required, the seed the website will be generated on  - defaults to the FLAG env.

### Example

```shell
# Set Environment Variable(s)
export PORT=8080
export SEED=test
export FLAG=test
# Docker Container
docker run -e PORT -e SEED -e FLAG -p $PORT:$PORT codecup-codeday/chal-xss:latest
# Docker Container w/ Init
docker run -it --init -e PORT -e SEED -e FLAG -p $PORT:$PORT codecup-codeday/chal-xss:latest
```
