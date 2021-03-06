import React, { useEffect, useState } from "react";
import { SEO } from "@components";
import { useLocation } from "@reach/router";
import Helmet from "react-helmet";
import Link from "gatsby-link";
import { MDXProvider } from "@mdx-js/react";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { useHeader } from "@context/header-context";
import { graphql } from "gatsby";
import Img from "gatsby-image";
import styles, { courseHeaderOverrides } from "./post.styles";
import Github from "@svgs/github";
import "../../components/global-styles/font-dank.css";
import "dracula-prism/css/dracula-prism.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/command-line/prism-command-line.css";
import "./prism-overrides.css";

const getDocHeight = () => {
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
    );
};

const Tags = ({ tags }: { tags: [] }) => {
    if (!tags || tags.length === 0) return null;
    return (
        <ul className="tags">
            {tags.map((tag: any) => {
                return (
                    <li key={tag}>
                        <Link to={`/tags/${tag.split(" ").join("-").toLowerCase()}`}>#{tag}</Link>
                    </li>
                );
            })}
        </ul>
    );
};

const Lead = ({ children }: { children: React.ReactNode }) => {
    return <p className="lead">{children}</p>;
};
const Box = ({ children }: { children: React.ReactNode }) => {
    return <div className="box shadow">{children}</div>;
};

const shortcodes = { Link, Lead, Box }; // Provide common components here

const Post = (props: any) => {
    const [progress, setProgress] = useState(0);
    const { pathname } = useLocation();
    const { setHeader, setHeaderStyles } = useHeader();
    const { data, pageContext } = props;
    const { mdx, site } = data;
    const { next, previous } = pageContext;
    const date = new Date(mdx.frontmatter.date);
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    const dateString = date.toLocaleDateString("en-GB", options);

    const calcProgress = () => {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        let footerHeight = 0;
        let postFooterHeight = 0;
        const footer = document.querySelector("#footer");
        const postFooter = document.querySelector("#post-footer");
        if (footer !== null) {
            footerHeight = (footer as HTMLElement).offsetHeight;
        }
        if (postFooter !== null) {
            postFooterHeight = (postFooter as HTMLElement).offsetHeight;
        }
        const docHeight = getDocHeight();
        const totalDocScrollLength = docHeight - footerHeight - postFooterHeight - windowHeight;
        const scrollPostion = Math.floor((scrollTop / totalDocScrollLength) * 100);
        setProgress(scrollPostion > 100 ? 100 : scrollPostion);
    };
    useEffect(() => {
        setHeader(<div style={{ height: 0 }}></div>);
        setHeaderStyles(courseHeaderOverrides);
        if (typeof window !== "undefined") {
            calcProgress();
            window.addEventListener("scroll", calcProgress);
            // window.addEventListener("resize", calcProgress);
        }
        return () => {
            setHeader(null);
            setHeaderStyles(null);
            if (typeof window !== "undefined") {
                window.removeEventListener("scroll", calcProgress);
                // window.removeEventListener("resize", calcProgress);
            }
        };
    }, []);

    return (
        <div css={styles}>
            <div className="progress">
                <progress max="100" value={progress}>
                    {progress}%
                </progress>
            </div>
            <SEO
                image={
                    mdx.frontmatter.featuredImage
                        ? mdx.frontmatter.featuredImage.childImageSharp.original.src
                        : undefined
                }
                title={mdx.frontmatter.title}
                description={mdx.excerpt}
                pathname={pathname}
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "NewsArticle",
                        // mainEntityOfPage: {
                        //     "@type": "WebPage",
                        //     "@id": `${site.siteMetadata.siteUrl}${pathname}`
                        // },
                        headline: mdx.frontmatter.title,
                        image: mdx.frontmatter.featuredImage
                            ? [
                                  site.siteMetadata.siteUrl +
                                      mdx.frontmatter.featuredImage.childImageSharp.original.src
                              ]
                            : undefined,
                        datePublished: mdx.frontmatter.date,
                        dateModified: mdx.frontmatter.date
                        // author: {
                        //     "@type": "Person",
                        //     name: "Ali Alaa"
                        // }
                    })}
                </script>
            </Helmet>
            <MDXProvider components={shortcodes}>
                <article>
                    <header className="header">
                        <div className="header-bg">
                            <Img
                                imgStyle={{
                                    objectFit: "cover",
                                    objectPosition: "50% 50%"
                                }}
                                fluid={mdx.frontmatter.featuredImage.childImageSharp.fluid}
                                alt=""
                            />
                        </div>
                        <div className="container">
                            <div className="title-wrap">
                                <h1 className="title">{mdx.frontmatter.title}</h1>
                                <div className="info">
                                    Published on:{" "}
                                    <time dateTime={mdx.frontmatter.date}>{dateString}</time>
                                    <p>
                                        Reading Time: {mdx.timeToRead} minute
                                        {mdx.timeToRead > 1 && "s"}
                                    </p>
                                </div>
                                <Tags tags={mdx.frontmatter.tags} />
                            </div>
                        </div>
                    </header>
                    {/* {mdx.frontmatter.featuredImage && (
                        <Img fluid={mdx.frontmatter.featuredImage.childImageSharp.fluid} />
                    )} */}
                    <div className="post-content">
                        <div className="container">
                            <div className="post-content-inner">
                                <MDXRenderer>{mdx.body}</MDXRenderer>
                            </div>
                        </div>
                    </div>
                    <footer id="post-footer">
                        <div className="container">
                            <div className="tags-edit">
                                <div className="tags-wrap">
                                    <p>Tagged:</p>
                                    <Tags tags={mdx.frontmatter.tags} />
                                </div>
                                <a
                                    href={`https://github.com/alialaa/alialaa/blob/master/src/posts${
                                        mdx.fileAbsolutePath.split("src/posts")[1]
                                    }`}
                                    className="edit-link"
                                >
                                    <Github focusable="false" aria-hidden /> Edit on GitHub
                                </a>
                            </div>

                            <nav
                                className="posts-navigation"
                                role="navigation"
                                aria-label="Posts Navigation"
                            >
                                <ul
                                    style={{
                                        justifyContent: previous ? "space-between" : "flex-end"
                                    }}
                                >
                                    {previous && (
                                        <li className="post-nav-prev">
                                            <Link
                                                className="shadow"
                                                to={`/blog/${previous.frontmatter.slug}`}
                                            >
                                                <span className="post-nav-subtitle">
                                                    Previous Post:{" "}
                                                </span>
                                                <span className="post-nav-title">
                                                    {previous.frontmatter.title}
                                                </span>
                                            </Link>
                                        </li>
                                    )}
                                    {next && (
                                        <li className="post-nav-next">
                                            <Link
                                                className="shadow"
                                                to={`/blog/${next.frontmatter.slug}`}
                                            >
                                                <span className="post-nav-subtitle">
                                                    Next Post:{" "}
                                                </span>
                                                <span className="post-nav-title">
                                                    {next.frontmatter.title}
                                                </span>
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </nav>
                        </div>
                    </footer>
                </article>
            </MDXProvider>
        </div>
    );
};
export default Post;

export const query = graphql`
    query BlogPostQuery($id: String) {
        site {
            siteMetadata {
                siteUrl
            }
        }
        mdx(id: { eq: $id }) {
            id
            body
            timeToRead
            fileAbsolutePath
            frontmatter {
                title
                date
                tags
                featuredImage {
                    childImageSharp {
                        fluid(maxWidth: 800) {
                            ...GatsbyImageSharpFluid
                        }
                        original {
                            src
                        }
                    }
                }
            }
        }
    }
`;
