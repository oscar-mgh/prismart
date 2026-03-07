export class Id {
  private readonly value: string;

  private constructor(value: string) {
    if (!Id.isValid(value)) {
      throw new Error('Invalid Domain ID format');
    }
    this.value = value;
  }

  private static isValid(value: string): boolean {
    return /^[a-fA-F0-9]{24}$/.test(value);
  }

  public static fromString(value: string): Id {
    return new Id(value);
  }

  public getValue(): string {
    return this.value;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Id): boolean {
    return this.value === other.getValue();
  }
}
