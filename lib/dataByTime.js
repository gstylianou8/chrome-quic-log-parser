'use strict';

function sortBy (streamData, field) {
  return streamData.sort(function (a, b) {
    if (+a[field] < +b[field]) {
      return -1;
    }

    if (+a[field] > +b[field]) {
      return 1;
    }

    return 0;
  });
}


function fill (arr, length) {
  let diff = length - arr.length;
 
  return arr.concat(new Array(diff)).map(item => {
    return item || null;
  });
}

module.exports = function (streams, packets, interval) {

  interval = interval || 10;

  let results = {
    streams: {},
    packets:{},
    interval: interval,
    entries: 0,
    entriesPack:0
  };

  let streamResults = results.streams;
  let packetResults = results.packets;


  Object.keys(streams).forEach((id) => {
    streamResults[id] = {
      path: '',
      events: {}
    };

    let time = 0;
    
    let streamData = sortBy(streams[id], 'st');
    
    let streamDataIterator = streamData[Symbol.iterator]();
    
    let item = streamDataIterator.next().value;
    
    let streamTimeMax = 1 + streamData[streamData.length - 1].st;


    while (time <= streamTimeMax) {
      
      let events = streamResults[id].events[time] = streamResults[id].events[time] || [];

      // current item occurs outside of time window;
      // check the next time window
      if ((+item.st - time) > interval) {
        time = time + interval;
        continue;
      }

      // current item occurs within the time window
      // The 'QUIC_HTTP_STREAM_SEND_REQUEST_HEADERS' tag is the only one which has the 'path' field. 
      if (item.e === 'QUIC_HTTP_STREAM_SEND_REQUEST_HEADERS') {
        streamResults[id].path = item.headers[':path'];
      }

      events.push(item);

      item = streamDataIterator.next();

      if (item.done) {
        break;
      }

      item = item.value;
    }
  });

  let maxEvents = 0;

  Object.keys(results.streams).forEach(s => {
    let events = Object.keys(results.streams[s].events);
    if (events.length > maxEvents) {
      maxEvents = events.length
    }
  });

  results.entries = maxEvents;

 Object.keys(packets).forEach((id) => {
    packetResults[id] = {
      path: '',
      events: {}
    };

    let time = 0;
    
    let packetData = sortBy(packets[id], 'st');
    
    let packetDataIterator = packetData[Symbol.iterator]();
    
    let item = packetDataIterator.next().value;
    
    let packetTimeMax = 1 + packetData[packetData.length - 1].st;


    while (time <= packetTimeMax) {
      
      let events = packetResults[id].events[time] = packetResults[id].events[time] || [];

      // current item occurs outside of time window;
      // check the next time window
      if ((+item.st - time) > interval) {
        time = time + interval;
        continue;
      }

      events.push(item);

      item = packetDataIterator.next();

      if (item.done) {
        break;
      }

      item = item.value;
    }
  });

  let maxEventsPack = 0;

  Object.keys(results.packets).forEach(s => {
    let events = Object.keys(results.packets[s].events);
    if (events.length > maxEventsPack) {
      maxEventsPack = events.length
    }
  });

  results.entriesPack = maxEventsPack;

  return results;
};
