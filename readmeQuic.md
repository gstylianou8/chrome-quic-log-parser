#chrome-quic-log-parser

This repo contains a module for parsing the output of Chrome's QUIC
net-internals and turning it into something more useful. It is a modification of the repo 'chrome-htt2-log-parser'. 

## Changes
This module outpurs an html file and that html file contains a table which represents all specified in chronological order.
It is important to note that the first column of the table can be either a stream Id or a packet number, according to the tag. Stream id is specified by the QUIC_SESSION_STREAM_FRAME_SENT, the QUIC_SESSION_STREAM_FRAME_RECEIVED, the QUIC_HTTP_STREAM_SEND_REQUEST_HEADERS and the QUIC_SESSION_RST_STREAM_FRAME_SENT tags. A packet number is specified by the remaining tags. The QUIC_SESSION_ACK_FRAME_RECEIVED and the QUIC_SESSION_ACK_FRAME_SENT tags represent the largest observed packet number.

The changes from the original repo are:
 - dataByTime.js: The QUIC_HTTP_STREAM_SEND_REQUEST_HEADERS is the only tag which has a 'path' field and therefore is the only one
  		  which is examined for that field. In the 'chrome-http2-log-parser', the tags 'HTTP2_SESSION_SEND_HEADERS' and 'HTTP2_SESSION_RECV_PUSH_PROMISE' are examined for the 'path' field.
 - markers.js: The different tags used to achieve QUIC compatibility are specified here. 
 - parse.js: Each line in the 'txt' file is classified either as a start value, a key value or a header value and the appropriate actions are taken. In the case that a line is neither of these values, is simply ignored. 
 Also, the streamId variable can be set to the value of stream_id, quic_stream_id, packet_number or largest_observed field, according to the tag. 
 - html.jade: The HTTP tags are replaced with the ones specified in the markers.js file.	

