const resultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    marksObtained: Number,
    submittedAt: Date,
  });
  
  module.exports = mongoose.model('Result', resultSchema);
  