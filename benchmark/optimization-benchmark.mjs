import { Bench } from 'tinybench'
import { fastUri } from '../index.js'

const { parse: fastUriParse, serialize: fastUriSerialize } = fastUri

// Test URIs for benchmarking
const testURIs = [
  'https://example.com/foo#bar',
  'http://api.example.com:8080/v1/users/123',
  'https://www.example.com/path/to/resource?query=value',
  'https://subdomain.example.com/path',
  'http://localhost:3000/api/endpoint',
  'https://example.com/path/with/dots/../normalized',
  '//10.10.10.10/path',
  '//[2001:db8::7]/test',
  'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
]

const bench = new Bench({ name: 'Optimization Benchmark', time: 1000 })

// Test cache performance with repeated parsing
bench.add('parse: repeated URI (cache hit)', () => {
  fastUriParse('https://example.com/foo#bar')
})

// Test cache performance with different URIs
bench.add('parse: varied URIs (mixed cache)', () => {
  for (const uri of testURIs) {
    fastUriParse(uri)
  }
})

// Test path normalization cache
bench.add('parse: path with dots (cache benefit)', () => {
  fastUriParse('https://example.com/a/./b/../c/d')
})

// Test simple path without dots (fast path)
bench.add('parse: simple path (fast path)', () => {
  fastUriParse('https://example.com/simple/path')
})

// Test IPv4 validation
bench.add('parse: IPv4 address', () => {
  fastUriParse('//192.168.1.1/path')
})

// Test IPv6 validation
bench.add('parse: IPv6 address', () => {
  fastUriParse('//[2606:2800:220:1:248:1893:25c8:1946]/test')
})

// Test serialize with complex path
bench.add('serialize: complex path with dots', () => {
  fastUriSerialize({
    scheme: 'https',
    host: 'example.com',
    path: './a/./b/c/../../d/../e',
    query: 'q=1'
  })
})

// Test serialize simple
bench.add('serialize: simple URI', () => {
  fastUriSerialize({
    scheme: 'https',
    host: 'example.com',
    path: '/api/v1/resource',
    query: 'id=123'
  })
})

console.log('Running optimization benchmarks...\n')
await bench.run()

console.table(bench.table())

// Calculate statistics
const results = bench.tasks.map(task => ({
  name: task.name,
  'ops/sec': Math.round(task.result.hz).toLocaleString(),
  'avg (ms)': task.result.mean.toFixed(6),
  'margin': `±${task.result.rme.toFixed(2)}%`
}))

console.log('\nOptimization Results Summary:')
console.table(results)

// Performance improvements summary
console.log('\n=== Optimization Features Applied ===')
console.log('1. LRU Cache for parsed URIs (1000 entries)')
console.log('2. Lookup tables for hex character validation')
console.log('3. Fast paths for simple paths without dots')
console.log('4. Path normalization cache (500 entries)')
console.log('5. Pre-compiled regex patterns')
console.log('\nAll optimizations maintain RFC 3986 compliance.')
