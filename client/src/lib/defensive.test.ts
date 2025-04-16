import {
  safeGet,
  safeCall,
  safeGetNested,
  safeFormatNumber,
  safeFormatDate,
  safeExecute,
  safeParseJson,
  safeStringify
} from './defensive';

describe('Defensive Programming Utilities', () => {
  describe('safeGet', () => {
    it('returns property value when object exists', () => {
      const obj = { name: 'John', age: 30 };
      expect(safeGet(obj, 'name', 'Unknown')).toBe('John');
      expect(safeGet(obj, 'age', 0)).toBe(30);
    });
    
    it('returns fallback when object is null or undefined', () => {
      expect(safeGet(null, 'name', 'Unknown')).toBe('Unknown');
      expect(safeGet(undefined, 'age', 0)).toBe(0);
    });
    
    it('returns fallback when property does not exist', () => {
      const obj = { name: 'John' };
      expect(safeGet(obj, 'address' as any, 'No address')).toBe('No address');
    });
  });
  
  describe('safeCall', () => {
    it('calls method when object and method exist', () => {
      const obj = {
        greet: (name: string) => `Hello, ${name}!`,
        count: (from: number, to: number) => to - from
      };
      
      expect(safeCall(obj, 'greet', ['John'], 'Failed')).toBe('Hello, John!');
      expect(safeCall(obj, 'count', [5, 10], -1)).toBe(5);
    });
    
    it('returns fallback when object is null or undefined', () => {
      expect(safeCall(null, 'greet', ['John'], 'Failed')).toBe('Failed');
      expect(safeCall(undefined, 'count', [5, 10], -1)).toBe(-1);
    });
    
    it('returns fallback when method does not exist', () => {
      const obj = { name: 'John' };
      expect(safeCall(obj, 'greet' as any, ['World'], 'Failed')).toBe('Failed');
    });
    
    it('returns fallback when method throws an error', () => {
      const obj = {
        danger: () => { throw new Error('Boom!'); }
      };
      
      expect(safeCall(obj, 'danger', [], 'Failed')).toBe('Failed');
    });
  });
  
  describe('safeGetNested', () => {
    it('returns nested property when full path exists', () => {
      const obj = {
        user: {
          address: {
            street: '123 Main St',
            city: 'New York'
          },
          profile: {
            name: 'John'
          }
        }
      };
      
      expect(safeGetNested(obj, 'user.address.street', 'Unknown')).toBe('123 Main St');
      expect(safeGetNested(obj, 'user.profile.name', 'Unknown')).toBe('John');
    });
    
    it('returns fallback when object is null or undefined', () => {
      expect(safeGetNested(null, 'user.name', 'Unknown')).toBe('Unknown');
      expect(safeGetNested(undefined, 'user.age', 0)).toBe(0);
    });
    
    it('returns fallback when any part of the path does not exist', () => {
      const obj = {
        user: {
          profile: {
            name: 'John'
          }
        }
      };
      
      expect(safeGetNested(obj, 'user.address.street', 'Unknown')).toBe('Unknown');
      expect(safeGetNested(obj, 'company.name', 'Unknown')).toBe('Unknown');
    });
  });
  
  describe('safeFormatNumber', () => {
    it('formats number correctly', () => {
      expect(safeFormatNumber(1234.56, '0')).toMatch(/1,234.56|1.234,56/); // Account for different locales
      expect(safeFormatNumber('7890', '0')).toMatch(/7,890|7.890/);
    });
    
    it('returns fallback for null or undefined', () => {
      expect(safeFormatNumber(null, 'N/A')).toBe('N/A');
      expect(safeFormatNumber(undefined, 'N/A')).toBe('N/A');
    });
    
    it('returns fallback for NaN', () => {
      expect(safeFormatNumber(NaN, 'Invalid')).toBe('Invalid');
      expect(safeFormatNumber('not-a-number', 'Invalid')).toBe('Invalid');
    });
  });
  
  describe('safeFormatDate', () => {
    it('formats date correctly', () => {
      const date = new Date(2023, 0, 15); // Jan 15, 2023
      expect(safeFormatDate(date, 'Invalid')).not.toBe('Invalid');
      expect(safeFormatDate('2023-01-15', 'Invalid')).not.toBe('Invalid');
    });
    
    it('returns fallback for null or undefined', () => {
      expect(safeFormatDate(null, 'N/A')).toBe('N/A');
      expect(safeFormatDate(undefined, 'N/A')).toBe('N/A');
    });
    
    it('returns fallback for invalid dates', () => {
      expect(safeFormatDate('not-a-date', 'Invalid')).toBe('Invalid');
      expect(safeFormatDate(new Date('invalid-date'), 'Invalid')).toBe('Invalid');
    });
  });
  
  describe('safeExecute', () => {
    it('executes function and returns its result', () => {
      const add = (a: number, b: number) => a + b;
      expect(safeExecute(add, -1, 5, 10)).toBe(15);
    });
    
    it('returns fallback when function throws', () => {
      const danger = () => { throw new Error('Boom!'); };
      expect(safeExecute(danger, 'Failed')).toBe('Failed');
    });
  });
  
  describe('safeParseJson', () => {
    it('parses valid JSON correctly', () => {
      const json = '{"name":"John","age":30}';
      expect(safeParseJson(json, null)).toEqual({ name: 'John', age: 30 });
    });
    
    it('returns fallback for null or undefined', () => {
      expect(safeParseJson(null, { empty: true })).toEqual({ empty: true });
      expect(safeParseJson(undefined, [])).toEqual([]);
    });
    
    it('returns fallback for invalid JSON', () => {
      expect(safeParseJson('{invalid json', { error: true })).toEqual({ error: true });
    });
  });
  
  describe('safeStringify', () => {
    it('stringifies object correctly', () => {
      const obj = { name: 'John', age: 30 };
      expect(safeStringify(obj, 'Failed')).toBe('{"name":"John","age":30}');
    });
    
    it('returns fallback when stringification fails', () => {
      const circular: any = {};
      circular.self = circular; // Create circular reference
      
      expect(safeStringify(circular, 'Failed')).toBe('Failed');
    });
  });
});