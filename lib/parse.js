'use strict';

var fs = require('fs');
var path = require('path');
var readline = require('readline');

var RECORD_START = /^t=\s*(\d+)\s\[st=\s*(\d+)\]\s+(.+)$/;
var RECORD_KEY_VALUE = /^\s+-->\s(\S+)\s=\s\"?([^\"]+)\"?/;
var RECORD_HEADERS = /^\s+(--> )?(:?[^:]+):\s(.+)$/;

var records = [];
var currentRecord;

function parse (logfile, cb) {
  let input = readline.createInterface({
    input: fs.createReadStream(logfile, {
      encoding: 'utf-8'
    })
  });

  input.on('line', data => {
    let recordStartMatch = data.match(RECORD_START);
    let recordKeyValueMatch = data.match(RECORD_KEY_VALUE);
    let recordHeadersMatch = data.match(RECORD_HEADERS);

    if (recordStartMatch) {      
      if (currentRecord) {
        records.push(currentRecord);
      }
 	    
      currentRecord = {
        t : recordStartMatch[1],
        st : recordStartMatch[2],
        e : recordStartMatch[3]
      };

      return;
    }
    else if (recordKeyValueMatch) {
      currentRecord[recordKeyValueMatch[1]] = recordKeyValueMatch[2];
      return;
    }

    else if (recordHeadersMatch) {
      currentRecord.headers = currentRecord.headers || {};
      currentRecord.headers[recordHeadersMatch[2]] = recordHeadersMatch[3];
      return;
    }
    // the else statement is executed in the case that a line does not match with either of the variables 
    // solves the issue of data that could not be parsed (e.g. "CHLO" or "REJ") 
    else
      return;
    
    cb(new Error(`Could not parse ${data}`));
  });
	 
	
  input.on('close', () => {
    let data = {
      records: records,
      streams: {}
    };

    // stream_id and quic_stream_is stored by:
    // QUIC_SESSION_STREAM_FRAME_SENT,  QUIC_SESSION_STREAM_FRAME_RECEIVED, QUIC_HTTP_STREAM_SEND_REQUEST_HEADERS and QUIC_SESSION_RST_STREAM_FRAME_SENT
    // packet_number is stored by:
    // QUIC_SESSION_PACKET_SENT and QUIC_SESSION_UNAUTHENTICATED_PACKET_HEADER_RECEIVED.
    // largest_observed is stored by: 
    // QUIC_SESSION_ACK_FRAME_RECEIVED and QUIC_SESSION_ACK_FRAME_SENT.
    records.forEach(r => {
      let streamId = r.stream_id || r.quic_stream_id || r.packet_number || r.largest_observed;

      if (streamId) {
        data.streams[streamId] = data.streams[streamId] || [];
        data.streams[streamId].push(r);
      }

    });

    cb(null, data);
  });
}

module.exports = parse;
