// src/controllers/section.controller.js
const { Course, Section, Lesson } = require('@/models');
const { ResponseFormatter, logger } = require('@/utils');

class SectionController {

  async getCourseSections(req, res) {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return ResponseFormatter.notFound(res, {
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }
    
    const sections = await Section.find({ course: courseId })
      .sort({ order: 1 })
      .populate('lessonsCount');
    
    logger.info(`Sections retrieved for course: ${courseId}`);
    
    return ResponseFormatter.success(res, {
      message: 'Sections retrieved successfully',
      data: { sections }
    });
  }

  async createSection(req, res) {
    const { courseId } = req.params;
    const { title, description, order } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return ResponseFormatter.notFound(res, {
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }
    
    let sectionOrder = order;
    if (!sectionOrder) {
      const lastSection = await Section.findOne({ course: courseId })
        .sort({ order: -1 });
      sectionOrder = lastSection ? lastSection.order + 1 : 1;
    }
    
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
    
    const section = await Section.create({
      title: title.trim(),
      description: description?.trim(),
      course: courseId,
      order: sectionOrder
    });
    
    logger.info(`Section created: ${section._id} in course ${courseId}`);
    
    return ResponseFormatter.created(res, {
      message: 'Section created successfully',
      data: { section }
    });
  }

  async getSectionDetail(req, res) {
    const { id } = req.params;
    
    const section = await Section.findById(id);
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
    const lessons = await Lesson.find({ section: id })
      .sort({ order: 1 })
      .select('title duration order isPreview isPublished');
    
    return ResponseFormatter.success(res, {
      message: 'Section retrieved successfully',
      data: {
        section,
        lessons
      }
    });
  }

  async updateSection(req, res) {
    const { id } = req.params;
    const { title, description, order } = req.body;
    
    const section = await Section.findById(id);
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
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
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (order) updateData.order = parseInt(order);
    
    const updatedSection = await Section.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    logger.info(`Section updated: ${id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Section updated successfully',
      data: { section: updatedSection }
    });
  }

  async deleteSection(req, res) {
    const { id } = req.params;
    
    const section = await Section.findById(id);
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
    const lessonsCount = await Lesson.countDocuments({ section: id });
    if (lessonsCount > 0) {
      return ResponseFormatter.badRequest(res, {
        message: 'Cannot delete section with lessons. Remove lessons first.',
        code: 'SECTION_HAS_LESSONS'
      });
    }
    
    await Section.findByIdAndDelete(id);
    
    logger.info(`Section deleted: ${id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Section deleted successfully'
    });
  }

  async publishSection(req, res) {
    const { id } = req.params;
    
    const section = await Section.findById(id);
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
    if (section.isPublished) {
      return ResponseFormatter.badRequest(res, {
        message: 'Section is already published',
        code: 'SECTION_ALREADY_PUBLISHED'
      });
    }
    
    section.isPublished = true;
    await section.save();
    
    logger.info(`Section published: ${id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Section published successfully',
      data: { section }
    });
  }

  async unpublishSection(req, res) {
    const { id } = req.params;
    
    const section = await Section.findByIdAndUpdate(
      id,
      { isPublished: false },
      { new: true }
    );
    
    if (!section) {
      return ResponseFormatter.notFound(res, {
        message: 'Section not found',
        code: 'SECTION_NOT_FOUND'
      });
    }
    
    logger.info(`Section unpublished: ${id}`);
    
    return ResponseFormatter.success(res, {
      message: 'Section unpublished successfully',
      data: { section }
    });
  }

  async reorderSections(req, res) {
    const { courseId } = req.params;
    const { sectionOrders } = req.body;
    
    if (!Array.isArray(sectionOrders) || sectionOrders.length === 0) {
      return ResponseFormatter.badRequest(res, {
        message: 'Section orders array is required',
        code: 'INVALID_SECTION_ORDERS'
      });
    }
    
    const updatePromises = sectionOrders.map(item =>
      Section.findByIdAndUpdate(
        item.sectionId,
        { order: item.order },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    logger.info(`Sections reordered for course: ${courseId}`);
    
    return ResponseFormatter.success(res, {
      message: 'Sections reordered successfully'
    });
  }
}

module.exports = new SectionController();