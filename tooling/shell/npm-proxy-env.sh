#!/bin/sh

# npm 11 warns about the legacy npm_config_* proxy aliases. npm and Node
# already honor the standard HTTP_PROXY/HTTPS_PROXY variables, so retaining
# the aliases is unnecessary and will become an error in a future npm release.
unset npm_config_http_proxy npm_config_https_proxy
