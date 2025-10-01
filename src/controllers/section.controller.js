const { Course, Section, Lesson } = require('@/models');
const { ResponseFormatter, logger } = require('@/utils');
const { courseErrors, sectionErrors, commonErrors } = require('@/constants/errors');
const { sectionSuccess } = require('@/constants/success');
const mongoose = require('mongoose');

/**
 * Section Controller
 * Handles section management operations for course organization
 */
class SectionController {

  /**
   * Get all sections for a course
   * Returns sections with lesson count and statistics
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.courseId - Course ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with sections list
   */
  async getCourseSections(req, res) {
    const { courseId } = req.params;
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ResponseFormatter.notFound(res, {
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }
    
    // Get all sections with lesson count
    const sections = await Section.find({ course: courseId })
      .sort({ order: 1 });
    
    // Calculate lesson counts for each section
    const sectionsWithStats = await Promise.all(
      sections.map(async (section) => {
        const lessonsCount = await Lesson.countDocuments({ section: section._id });
        const publishedLessonsCount = await Lesson.countDocuments({ 
          section: section._id, 
          isPublished: true 
        });
        
        return {
          ...section.toObject(),
          lessonsCount,
          publishedLessonsCount
        };
      })
    );
    
    logger.info(`Sections retrieved for course: ${courseId}, count: ${sections.length}`);
    
    return ResponseFormatter.success(res, {
      message: 'Sections retrieved successfully',
      data: { 
        sections: sectionsWithStats,
        totalSections: sections.length
      }
    });
  }

  /**
   * Create new section in course
   * Admin creates section to organize lessons
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.courseId - Course ID
   * @param {Object} req.body - Section data
   * @param {string} req.body.title - Section title
   * @param {string} req.body.description - Section description (optional)
   * @param {number} req.body.order - Section order (optional, auto-calculated)
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with created section
   */
  async createSection(req, res) {
    const { courseId } = req.params;
    const { title, description, order } = req.body;
    
    // Validate required fields
    if (!title || title.trim().length === 0) {
      return ResponseFormatter.badRequest(res, {
        message: 'Section title is required',
        code: 'MISSING_SECTION_TITLE'
      });
    }
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ResponseFormatter.notFound(res, {
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }
    
    // Calculate section order if not provided
    let sectionOrder = order;
    if (!sectionOrder) {
      const lastSection = await Section.findOne({ course: courseId })
        .sort({ order: -1 });
      sectionOrder = lastSection ? lastSection.order + 1 : 1;
    }
    
    // Check for duplicate order
    const existingSection = await Section.findOne({
      course: courseId,
      order: sectionOrder
    });
    
    if (existingSection) {
      return ResponseFormatter.conflict(res, {
        message: 'Section with this order already exists',
        code: 'SECTION_ORDER_EXISTS'
      });
    }
    
    // Create section
    const section = await Section.create({
      title: title.trim(),
      description: description?.trim() || '',
      course: courseId,
      order: sectionOrder,
      isPublished: false
    });
    
    logger.info(`Section created: ${section._id} in course ${courseId} by admin ${req.user.id}`);
    
    return ResponseFormatter.created(res, {
      message: 'Section created successfully',
      data: { section }
    });
  }

  /**
   * Get section details with lessons
   * Returns section info with all lessons
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Section ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with section and lessons
   */
  async getSectionDetail(req, res) {
    const { id } = req.params;
    
    // Find section and populate course info
    const section = await Section.findById(id)
      .populate('course', 'title isPublished');
    
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
    // Get all lessons in this section
    const lessons = await Lesson.find({ section: id })
      .sort({ order: 1 })
      .select('title duration order isPreview isPublished video.defaultQuality');
    
    // Calculate statistics
    const stats = {
      totalLessons: lessons.length,
      publishedLessons: lessons.filter(l => l.isPublished).length,
      previewLessons: lessons.filter(l => l.isPreview).length,
      totalDuration: lessons.reduce((sum, l) => sum + (l.duration || 0), 0)
    };
    
    logger.info(`Section detail retrieved: ${id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Section retrieved successfully',
      data: {
        section,
        lessons,
        stats
      }
    });
  }

  /**
   * Update section
   * Admin updates section title, description, or order
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Section ID
   * @param {Object} req.body - Update data
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with updated section
   */
  async updateSection(req, res) {
    const { id } = req.params;
    const { title, description, order } = req.body;
    
    // Validate at least one field is provided
    if (!title && description === undefined && !order) {
      return ResponseFormatter.badRequest(res, {
        message: 'At least one field (title, description, or order) must be provided',
        code: 'NO_UPDATE_DATA'
      });
    }
    
    // Find section
    const section = await Section.findById(id);
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
    // Check for order conflict if order is being changed
    if (order && order !== section.order) {
      const existingSection = await Section.findOne({
        course: section.course,
        order: order,
        _id: { $ne: id }
      });
      
      if (existingSection) {
        return ResponseFormatter.conflict(res, {
          message: 'Section with this order already exists',
          code: 'SECTION_ORDER_EXISTS'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (title) {
      if (title.trim().length === 0) {
        return ResponseFormatter.badRequest(res, {
          message: 'Section title cannot be empty',
          code: 'INVALID_SECTION_TITLE'
        });
      }
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || '';
    }
    if (order) {
      updateData.order = parseInt(order);
    }
    
    // Update section
    const updatedSection = await Section.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    logger.info(`Section updated: ${id} by admin ${req.user.id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Section updated successfully',
      data: { section: updatedSection }
    });
  }

 /**
 * Delete section
 * Admin can only delete unpublished sections without lessons
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Section ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
  async deleteSection(req, res) {
    const { id } = req.params;
    
    // Find section
    const section = await Section.findById(id);
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
    // Check if section is published
    if (section.isPublished) {
      return ResponseFormatter.badRequest(res, {
        message: 'Cannot delete published section. Unpublish it first.',
        code: 'CANNOT_DELETE_PUBLISHED_SECTION'
      });
    }
    
    // Check if section has lessons
    const lessonsCount = await Lesson.countDocuments({ section: id });
    
    if (lessonsCount > 0) {
      return ResponseFormatter.badRequest(res, {
        message: `Cannot delete section with ${lessonsCount} lesson(s). Delete all lessons first.`,
        code: 'SECTION_HAS_LESSONS',
        data: { 
          lessonsCount,
          suggestion: 'Delete all lessons in this section before deleting the section'
        }
      });
    }
    
    // Delete section
    await Section.findByIdAndDelete(id);
    
    logger.info(`Section deleted: ${id} by admin ${req.user.id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Section deleted successfully',
      code: 'SECTION_DELETED'
    });
  }
  
  /**
 * Publish section
 * Makes section visible to students
 * Note: Lessons must be published separately
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Section ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
  async publishSection(req, res) {
    const { id } = req.params;
    
    // Find section
    const section = await Section.findById(id);
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
    // Check if already published
    if (section.isPublished) {
      return ResponseFormatter.badRequest(res, {
        message: 'Section is already published',
        code: 'SECTION_ALREADY_PUBLISHED'
      });
    }
    
    // Publish section
    section.isPublished = true;
    await section.save();
    
    logger.info(`Section published: ${id} by admin ${req.user.id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Section published successfully',
      code: 'SECTION_PUBLISHED',
      data: { section }
    });
  }

  /**
 * Unpublish section
 * Hides section from students
 * Note: Lessons remain in their current state (published/unpublished)
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Section ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
  async unpublishSection(req, res) {
    const { id } = req.params;
    
    // Find section
    const section = await Section.findById(id);
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
    // Check if already unpublished
    if (!section.isPublished) {
      return ResponseFormatter.badRequest(res, {
        message: 'Section is already unpublished',
        code: 'SECTION_ALREADY_UNPUBLISHED'
      });
    }
    
    // Unpublish section
    section.isPublished = false;
    await section.save();
    
    logger.info(`Section unpublished: ${id} by admin ${req.user.id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Section unpublished successfully',
      code: 'SECTION_UNPUBLISHED',
      data: { section }
    });
  }

  /**
   * Reorder sections in course
   * Admin changes section order
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {string} req.params.courseId - Course ID
   * @param {Object} req.body - Reorder data
   * @param {Array} req.body.sectionOrders - Array of {sectionId, order}
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   */
  async reorderSections(req, res) {
    const { courseId } = req.params;
    const { sectionOrders } = req.body;
    
    if (!Array.isArray(sectionOrders) || sectionOrders.length === 0) {
      return ResponseFormatter.badRequest(res, {
        message: 'Section orders array is required',
        code: 'INVALID_SECTION_ORDERS'
      });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return ResponseFormatter.notFound(res, {
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }
    
    const sectionIds = sectionOrders.map(item => item.sectionId);
    
    const sections = await Section.find({
      _id: { $in: sectionIds },
      course: courseId
    });
    
    if (sections.length !== sectionIds.length) {
      return ResponseFormatter.badRequest(res, {
        message: 'Some sections not found or do not belong to this course',
        code: 'INVALID_SECTIONS'
      });
    }
    
    const orders = sectionOrders.map(item => item.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      return ResponseFormatter.badRequest(res, {
        message: 'Duplicate order numbers found',
        code: 'DUPLICATE_ORDERS'
      });
    }
    
    const updatePromises = sectionOrders.map(item =>
      Section.findByIdAndUpdate(
        item.sectionId,
        { order: parseInt(item.order) },
        { new: true }
      )
    );
    
    const updatedSections = await Promise.all(updatePromises);
    
    logger.info(`Sections reordered for course: ${courseId}, count: ${sectionOrders.length} by admin ${req.user.id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Sections reordered successfully',
      data: {
        updatedCount: updatedSections.length,
        sections: updatedSections.sort((a, b) => a.order - b.order)
      }
    });
  }
}

module.exports = new SectionController();