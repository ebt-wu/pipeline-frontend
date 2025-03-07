import '@angular/localize/init'
import './jest-global-mocks'
import { TextEncoder, TextDecoder } from 'util'
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

setupZoneTestEnv()
