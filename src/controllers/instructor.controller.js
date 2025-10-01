const { Instructor, Course } = require('@/models');
const { ResponseFormatter, logger } = require('@/utils');

class InstructorController {
  
  /**
   * Get all instructors (Admin)
   */
  async getAllInstructors(req, res) {
    const { page = 1, limit = 20, search = '', isActive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const skip = (page - 1) * limit;
    
    const [instructors, total] = await Promise.all([
      Instructor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Instructor.countDocuments(query)
    ]);
    
    return ResponseFormatter.success(res, {
      message: 'Instructors retrieved successfully',
      data: {
        instructors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalInstructors: total
        }
      }
    });
  }
  
  /**
   * Create instructor (Admin)
   */
  async createInstructor(req, res) {
    const { name, email, avatar, bio, title, socials, expertise } = req.body;
    
    // Check if email already exists
    const existingInstructor = await Instructor.findOne({ email });
    if (existingInstructor) {
      return ResponseFormatter.conflict(res, {
        message: 'Instructor with this email already exists',
        code: 'INSTRUCTOR_EMAIL_EXISTS'
      });
    }
    
    const instructor = await Instructor.create({
      name,
      email,
      avatar,
      bio,
      title,
      socials,
      expertise,
      addedBy: req.user.id
    });
    
    logger.info(`Instructor created: ${instructor._id} by admin ${req.user.id}`);
    
    return ResponseFormatter.created(res, {
      message: 'Instructor created successfully',
      data: { instructor }
    });
  }
  
  /**
   * Get instructor detail
   */
  async getInstructorDetail(req, res) {
    const { id } = req.params;
    
    const instructor = await Instructor.findById(id);
    
    if (!instructor) {
      return ResponseFormatter.notFound(res, {
        message: 'Instructor not found',
        code: 'INSTRUCTOR_NOT_FOUND'
      });
    }
    
    // Get instructor's courses
    const courses = await Course.find({ instructor: id })
      .select('title thumbnail studentsCount isPublished')
      .sort({ createdAt: -1 });
    
    return ResponseFormatter.success(res, {
      message: 'Instructor details retrieved',
      data: {
        instructor,
        courses
      }
    });
  }
  
  /**
   * Update instructor
   */
  async updateInstructor(req, res) {
    const { id } = req.params;
    const { name, email, avatar, bio, title, socials, expertise, isActive } = req.body;
    
    const instructor = await Instructor.findById(id);
    
    if (!instructor) {
      return ResponseFormatter.notFound(res, {
        message: 'Instructor not found',
        code: 'INSTRUCTOR_NOT_FOUND'
      });
    }
    
    // Check email uniqueness if changing
    if (email && email !== instructor.email) {
      const emailExists = await Instructor.findOne({ email });
      if (emailExists) {
        return ResponseFormatter.conflict(res, {
          message: 'Email already in use',
          code: 'EMAIL_EXISTS'
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;
    if (title !== undefined) updateData.title = title;
    if (socials) updateData.socials = socials;
    if (expertise) updateData.expertise = expertise;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedInstructor = await Instructor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    logger.info(`Instructor updated: ${id} by admin ${req.user.id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Instructor updated successfully',
      data: { instructor: updatedInstructor }
    });
  }
  
  /**
   * Delete instructor
   */
  async deleteInstructor(req, res) {
    const { id } = req.params;
    
    const instructor = await Instructor.findById(id);
    
    if (!instructor) {
      return ResponseFormatter.notFound(res, {
        message: 'Instructor not found',
        code: 'INSTRUCTOR_NOT_FOUND'
      });
    }
    
    // Check if instructor has courses
    const coursesCount = await Course.countDocuments({ instructor: id });
    
    if (coursesCount > 0) {
      return ResponseFormatter.badRequest(res, {
        message: `Cannot delete instructor with ${coursesCount} course(s). Reassign courses first.`,
        code: 'INSTRUCTOR_HAS_COURSES',
        data: { coursesCount }
      });
    }
    
    await Instructor.findByIdAndDelete(id);
    
    logger.info(`Instructor deleted: ${id} by admin ${req.user.id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Instructor deleted successfully'
    });
  }
}

module.exports = new InstructorController();