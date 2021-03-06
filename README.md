#chrome-quic-log-parser

This repo contains a module for parsing the output of Chrome's QUIC
net-internals and turning it into something more useful. It is a modification of the repo https://github.com/rmurphey/chrome-http2-log-parser. 

Screenshot: ![image](https://raw.githubusercontent.com/gstylianou8/chrome-quic-log-parser/master/screenshots/screenshot.png)


## Requirements
nodejs version >=4.2

Installation
```sh
npm install chrome-quic-log-parser
```

## Usage

Given a file `sessionQUIC.txt` gathered from `chrome://net-internals` a html file is produced.

Run `node test ` to see the data parsed from the log.

## Changes - QUIC compatibility
Generates two HTML tables representing the parsed log data.
It is important to note that the first table represents the stream Ids and the second table represents the packet numbers. 
Stream id is specified by the QUIC_SESSION_STREAM_FRAME_SENT, the QUIC_SESSION_STREAM_FRAME_RECEIVED, the QUIC_HTTP_STREAM_SEND_REQUEST_HEADERS and the QUIC_SESSION_RST_STREAM_FRAME_SENT tags. A packet number is specified by the remaining tags. The QUIC_SESSION_ACK_FRAME_RECEIVED and the QUIC_SESSION_ACK_FRAME_SENT tags represent the largest observed packet number.

The changes from the original repo are:
 - dataByTime.js: The QUIC_HTTP_STREAM_SEND_REQUEST_HEADERS is the only tag which has a 'path' field and therefore is the only one which is examined for that field. 
 - markers.js: The different tags used to achieve QUIC compatibility are specified here. 
 - parse.js: Each line in the 'txt' file is classified either as a start value, a key value or a header value and the appropriate actions are taken. In the case that a line is neither of these values, is simply ignored. 
 Also, the streamId variable can be set to the value of stream_id, quic_stream_id, packet_number or largest_observed field, according to the tag. 
 - html.jade: The HTTP tags are replaced with the ones specified in the markers.js file.


