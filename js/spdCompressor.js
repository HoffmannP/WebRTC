export default {
  compress (spd) {
    return spd.split('\r\n').reduce((a, c) => ({
      t: a.t + (
        a.k === c[0]
          ? (',' + c.substr(2))
          : ('|' + c)
      ),
      k: c[0]
    }), { t: 0 }).t.slice(2, -1)
  },

  decompress (sdp) {
    return sdp.split('|').map(l => l.split('=')).map(
      lines => lines[1]
        .split(',')
        .map(line => `${lines[0]}=${line}`)
        .join('\r\n')
    ).join('\r\n') + '\r\n'
  }
}
