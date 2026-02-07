import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const Blog = () => {
  const { isDark } = useContext(ThemeContext)

  const posts = [
    {
      title: 'Getting Started with SkillSwap',
      excerpt: 'Learn how to create an account and start your learning journey on SkillSwap.',
      date: 'Jan 15, 2024',
      author: 'Admin'
    },
    {
      title: 'Maximizing Your Learning with Notes',
      excerpt: 'Tips and tricks for effective note-taking and knowledge retention.',
      date: 'Jan 10, 2024',
      author: 'Sarah'
    },
    {
      title: 'Becoming a Great Teacher',
      excerpt: 'How to create engaging lecture content and earn tokens by teaching others.',
      date: 'Jan 5, 2024',
      author: 'John'
    },
    {
      title: 'Token Economy Explained',
      excerpt: 'Understanding how the token-based economy works and how to optimize your spending.',
      date: 'Dec 28, 2023',
      author: 'Admin'
    },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">SkillSwap Blog</h1>

        <div className="space-y-8">
          {posts.map((post, idx) => (
            <article
              key={idx}
              className={`rounded-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition cursor-pointer`}
            >
              <h2 className="text-2xl font-bold mb-3">{post.title}</h2>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                By <strong>{post.author}</strong> on {post.date}
              </p>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {post.excerpt}
              </p>
              <button className="text-blue-600 hover:underline font-semibold">
                Read More →
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Blog
