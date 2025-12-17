# gh2fj
Automatically mirror GitHub users and/or organizations to a Forgejo server

## Usage
```sh
git clone https://github.com/skylvie/gh2fj
cd gh2fj
pnpm i
pnpm build
# Configure `.env`
pnpm start
```

## `.env`
See `.env.example`

## SystemD
There is an example systemd server in `gh2fj.service`