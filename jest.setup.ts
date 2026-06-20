import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util';
import {
  ReadableStream,
  WritableStream,
  TransformStream,
  TextEncoderStream,
  TextDecoderStream,
} from 'stream/web';

// Polyfill standard encoding and stream globals that JSDOM might omit
Object.defineProperty(globalThis, 'TextDecoder', { value: TextDecoder, writable: true, configurable: true });
Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder, writable: true, configurable: true });
Object.defineProperty(globalThis, 'ReadableStream', { value: ReadableStream, writable: true, configurable: true });
Object.defineProperty(globalThis, 'WritableStream', { value: WritableStream, writable: true, configurable: true });
Object.defineProperty(globalThis, 'TransformStream', { value: TransformStream, writable: true, configurable: true });
Object.defineProperty(globalThis, 'TextEncoderStream', { value: TextEncoderStream, writable: true, configurable: true });
Object.defineProperty(globalThis, 'TextDecoderStream', { value: TextDecoderStream, writable: true, configurable: true });

const vm = require('vm');
const nativeStructuredClone = vm.runInThisContext('structuredClone');
Object.defineProperty(globalThis, 'structuredClone', { value: nativeStructuredClone, writable: true, configurable: true });

// Polyfill Web APIs in JSDOM sandbox using Next.js bundled Edge primitives
const primitives = require('next/dist/compiled/@edge-runtime/primitives');

Object.defineProperty(globalThis, 'Request', { value: primitives.Request, writable: true, configurable: true });
Object.defineProperty(globalThis, 'Response', { value: primitives.Response, writable: true, configurable: true });
Object.defineProperty(globalThis, 'Headers', { value: primitives.Headers, writable: true, configurable: true });

// Mock scrollIntoView which is not natively supported by jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn();
