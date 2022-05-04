
export enum GrantType {
  range = 'range',
  all = 'all',
  latest = 'latest'
}

export enum StreamHandling {
  e2e = 'e2e',
  direct = 'direct',
  lockbox = 'lockbox'
}

export enum StreamGranularity {
  single = 'single',
  batch = 'batch'
}