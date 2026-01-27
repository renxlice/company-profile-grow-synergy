export declare class BlogService {
    getAllBlogs(): Promise<any[]>;
    getBlogById(id: string): Promise<any>;
    getBlogBySlug(slug: string): Promise<any>;
    createBlog(createBlogDto: any): Promise<any>;
    updateBlog(id: string, updateBlogDto: any): Promise<any>;
    deleteBlog(id: string): Promise<void>;
    getBlogsByCategory(category: string): Promise<any[]>;
    searchBlogs(query: string): Promise<any[]>;
}
