const Appointment = require('../models/Appointment');

/**
 * Checks if a doctor has an overlapping appointment in the proposed time slot.
 * Returns true if a collision is detected.
 */
const checkForCollision = async (doctorId, proposedStart, proposedEnd, excludeAppointmentId = null) => {
  const query = {
    doctorId,
    status: { $ne: 'cancelled' }, // Ignore cancelled appointments
    $or: [
      {
        // Proposed starts during an existing appointment
        startTime: { $lt: proposedEnd },
        endTime: { $gt: proposedStart }
      }
    ]
  };

  // If updating, exclude the current appointment from the check
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const collision = await Appointment.findOne(query);
  return !!collision;
};

module.exports = {
  checkForCollision
};
