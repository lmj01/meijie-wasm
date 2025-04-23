#!/bin/bash

#default port
DEFAULT_PORT=8080
port=$DEFAULT_PORT

while getopts ":p:" opt; do
    case $opt in
        p)
            port="$OPTARG"
            ;;
        \?)
            echo "valid option: -$OPTARG" >&2
            exit 1
            ;;
        :)
            echo "option -$OPTARG need argument" >&2
            exit 1
            ;;
    esac
done

if !command -v http-server &> /dev/null; then
    echo "setup http-server..."
    npm install -g http-server || {
        echo "setup http-server failure"
        exit 1
    }
fi

echo "start http port $port"
echo "visit http://localhost:$port"
echo "enter Ctrl+C to stop"
http-server -p $port


