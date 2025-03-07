import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input"
import useDebounce from "@/hooks/useDebouncing";
import { useGetPost, useSearchPost } from "@/lib/react-quary/quaryAndMutation";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";


const Explore = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPost();
  const [searchValue, setsearchValue] = useState('');
  const debouncedValue = useDebounce(searchValue, 500);
  const { data: searchedPost, isFetching: isSearchFetching } = useSearchPost(debouncedValue);

  useEffect(() => {
    if (inView && !searchValue) fetchNextPage();
  }, [inView, searchValue])

  if (!posts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    )
  }

  const shouldShowSearchResult = searchValue !== "";
  const shouldShowPost = !shouldShowSearchResult && posts.pages.every((item) => item?.documents.length === 0);

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img src="/assets/icons/search.svg" alt="Search" width={24} height={24} />
          <Input type="text" placeholder="Search " className="explore-search" value={searchValue} onChange={(e) => setsearchValue(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-between w-full max-w-5xl mt-16 mb-7">
        <h2 className="body-bold md:h3-bold">Popular Today</h2>
        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 pointer">
          <p className="small-medium md:base-medium text-light-1"> All </p>
          <img src="/assets/icons/filter.svg " alt="Filter" height={20} width={20} />
        </div>
      </div>
      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {
          shouldShowSearchResult ? <SearchResults isSearchFetching={isSearchFetching} searchedPost={searchedPost} /> : shouldShowPost ? (
            <p className="text-light-4 mt-10 text-center w-full">
              End Of Post
            </p>
          ) : posts.pages.map((items, index) => (
            <GridPostList key={`page-${index}`} posts={items.documents} showUser = {true} showStats = {true}/>
          ))
        }
      </div>
      {
        hasNextPage && !searchValue && (
          <div ref={ref} className="mt-10">
            <Loader />
          </div>
        )
      }
    </div>
  )
}

export default Explore