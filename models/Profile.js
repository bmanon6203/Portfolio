import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  description: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  gmail: { type: String, default: '' },
  facebook: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
