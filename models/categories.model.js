const db = require("../db/connection");

exports.fetchCategories = () => {
  return db.query("SELECT * FROM categories;").then(({ rows }) => {
    return rows;
  });
};

exports.fetchReviewByID = (revID) => {
  return db
    .query(
      "SELECT reviews.* , COUNT(comments.review_ID) :: INT AS comment_count FROM reviews LEFT JOIN comments ON comments.review_id = reviews.review_id WHERE reviews.review_id=$1 GROUP BY reviews.review_id;",
      [revID]
    )
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `No review_id: ${revID}`,
        });
      }

      return rows[0];
    });
};

exports.updateReviewByID = (revID, incVotes) => {
  return db
    .query(
      "UPDATE reviews SET votes = votes +$2 WHERE review_ID=$1 RETURNING *;",
      [revID, incVotes]
    )
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `No review found for review_id: ${revID}`,
        });
      }
      return rows[0];
    });
};

exports.fetchUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

exports.fetchReviews = () => {
  return db
    .query(
      "SELECT reviews.*, COUNT(comments.review_id) :: INT AS comment_count FROM reviews LEFT JOIN comments ON comments.review_id = reviews.review_id GROUP BY reviews.review_id ORDER BY reviews.created_at DESC;"
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchCommentsByReviewID = async (revID) => {
  return (checkForReview = db
    .query("SELECT * FROM reviews WHERE review_id=$1", [revID])
    .then(({ rows }) => {
      if (rows[0]) {
        return db
          .query("SELECT * FROM comments WHERE review_id=$1", [revID])
          .then(({ rows }) => {
            return rows;
          });
      } else {
        return Promise.reject({
          status: 404,
          msg: `No review found for review_id: ${revID}`,
        });
      }
    }));
};
