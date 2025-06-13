export class CPU6502 {
  constructor(ppu) {
    this.A = 0x00;
    this.X = 0x00;
    this.Y = 0x00;
    this.SP = 0xFD;
    this.PC = 0x0000;
    this.STATUS = 0x24;
    this.ppu = ppu;
    this.memory = new Uint8Array(0x10000);
    this.instructions = {};
    this.buildInstructionSet();
  }

  reset() {
    this.PC = this.readWord(0xFFFC);
    this.SP = 0xFD;
    this.STATUS = 0x24;
  }

  readByte(addr) {
    if (addr >= 0x2000 && addr < 0x3000) {
      return this.ppu.readRegister(addr);
    }
    return this.memory[addr];
  }

  writeByte(addr, value) {
    if (addr >= 0x2000 && addr < 0x3000) {
      this.ppu.writeRegister(addr, value);
    } else {
      this.memory[addr] = value;
    }
  }

  readWord(addr) {
    return this.readByte(addr) | (this.readByte(addr + 1) << 8);
  }

  push(value) {
    this.writeByte(0x0100 + this.SP--, value);
  }

  pop() {
    return this.readByte(0x0100 + ++this.SP);
  }

  setFlag(flag, value) {
    if (value) this.STATUS |= flag;
    else this.STATUS &= ~flag;
  }

  getFlag(flag) {
    return (this.STATUS & flag) !== 0;
  }

  tick() {
    const opcode = this.readByte(this.PC++);
    const instr = this.instructions[opcode];
    if (instr) instr();
    else throw new Error(`Unknown opcode: ${opcode.toString(16)}`);
  }

  buildInstructionSet() {
    this.instructions[0xA9] = () => {
      const value = this.readByte(this.PC++);
      this.A = value;
      this.setFlag(0x02, this.A === 0);         // Zero
      this.setFlag(0x80, (this.A & 0x80) !== 0); // Negativo
    };
  }
}
