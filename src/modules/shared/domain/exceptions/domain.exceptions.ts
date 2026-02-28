export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with ID "${id}" not found`);
  }
}

export class EntityInactiveException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with ID "${id}" is inactive/deleted`);
  }
}

export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
