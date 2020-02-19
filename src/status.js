'use strict'

const { spawn } = require('child_process');

function getRowStatus() {
  return new Promise((resolve, reject) => {
    const status = spawn('git', ['status']);

    let output = '';
    status.stdout.on('data', data => {
      output += data;
    })

    let error = '';
    status.stderr.on('data', data => {
      error += data;
    })

    status.on('close', code => {
      if (code) {
        reject(error);
      } else {
        resolve(output);
      }
    });
  })
}

function getSplitStatus(raw) {
  raw.trim();
  const splitData = raw.split('\n');
  return splitData.filter(chunk => chunk.length > 0);
}

module.exports = {
  rawData: '',
  splitData: [],

  async raw() {
    if (!this.rawData) {
      this.rawData = await getRowStatus();
    }

    return this.rawData;
  },

  async split() {
    if (!Array.isArray(this.splitData)) {
      this.splitData = [];
    }

    if (this.splitData.length === 0) {
      this.splitData = getSplitStatus(await this.raw());
    }

    return this.splitData;
  },

  async branch() {
    const splitData = await this.split();
    const branchRow = splitData[0].split(' ');

    return branchRow[branchRow.length - 1];
  }
};
