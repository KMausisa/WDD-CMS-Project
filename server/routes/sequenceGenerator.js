var Sequence = require("../models/sequence");

class SequenceGenerator {
  constructor() {
    this.maxDocumentId = 0;
    this.maxMessageId = 0;
    this.maxContactId = 0;
    this.sequenceId = null;
  }

  // Fetch the sequence document and set the initial values
  async init() {
    try {
      const sequence = await Sequence.findOne().exec();
      this.sequenceId = sequence._id;
      this.maxDocumentId = sequence.maxDocumentId;
      this.maxMessageId = sequence.maxMessageId;
      this.maxContactId = sequence.maxContactId;
    } catch (err) {
      throw err;
    }
  }

  // nextId now returns a Promise and works asynchronously
  async nextId(collectionType) {
    let updateObject = {};
    let nextId;

    switch (collectionType) {
      case "documents":
        this.maxDocumentId++;
        updateObject = { maxDocumentId: this.maxDocumentId };
        nextId = this.maxDocumentId;
        break;
      case "messages":
        this.maxMessageId++;
        updateObject = { maxMessageId: this.maxMessageId };
        nextId = this.maxMessageId;
        break;
      case "contacts":
        this.maxContactId++;
        updateObject = { maxContactId: this.maxContactId };
        nextId = this.maxContactId;
        break;
      default:
        return Promise.reject("Invalid collection type");
    }

    try {
      // Update the sequence in the database
      await Sequence.updateOne(
        { _id: this.sequenceId },
        { $set: updateObject }
      );
      return nextId;
    } catch (err) {
      throw err; // Propagate error if the update fails
    }
  }
}

module.exports = new SequenceGenerator();
