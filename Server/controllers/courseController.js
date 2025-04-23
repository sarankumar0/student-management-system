const Course = require('../models/courseMaterial');

class CourseController {
  // Create a new course
  async createCourse(req, res) {
    try {
      // Add validation logic here
      const newCourse = new Course(req.body);
      const savedCourse = await newCourse.save();
      
      res.status(201).json({
        message: 'Course created successfully',
        course: savedCourse
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Error creating course',
        error: error.message 
      });
    }
  }

  // Get all courses
  async getAllCourses(req, res) {
    try {
      // Add filtering logic based on access level
      const { accessLevel } = req.query;
      
      const query = accessLevel 
        ? { accessLevel: accessLevel.toLowerCase() } 
        : {};

      const courses = await Course.find(query);
      
      res.json({
        message: 'Courses retrieved successfully',
        courses: courses
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving courses',
        error: error.message 
      });
    }
  }

  // Get single course by ID
  async getCourseById(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      
      if (!course) {
        return res.status(404).json({ 
          message: 'Course not found' 
        });
      }
      
      res.json({
        message: 'Course retrieved successfully',
        course: course
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving course',
        error: error.message 
      });
    }
  }

  // Update a course
  async updateCourse(req, res) {
    try {
      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true }
      );
      
      if (!updatedCourse) {
        return res.status(404).json({ 
          message: 'Course not found' 
        });
      }
      
      res.json({
        message: 'Course updated successfully',
        course: updatedCourse
      });
    } catch (error) {
      res.status(400).json({ 
        message: 'Error updating course',
        error: error.message 
      });
    }
  }

  // Delete a course
  async deleteCourse(req, res) {
    try {
      const deletedCourse = await Course.findByIdAndDelete(req.params.id);
      
      if (!deletedCourse) {
        return res.status(404).json({ 
          message: 'Course not found' 
        });
      }
      
      res.json({ 
        message: 'Course deleted successfully',
        course: deletedCourse 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting course',
        error: error.message 
      });
    }
  }
}

module.exports = new CourseController();