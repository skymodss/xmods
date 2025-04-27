interface PageProps {
  showRightSidebar?: boolean; // Add this line to define the prop
}

const Page: FaustPage<PageProps> = (props) => {
  const { isReady, isAuthenticated } = useSelector(
    (state: RootState) => state.viewer.authorizedUser,
  );
  const router = useRouter();

  if (NC_SITE_SETTINGS['submissions-settings']?.enable === false) {
    return <Page404Content />;
  }

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  if (!isReady) {
    return (
      <div className="container flex items-center justify-center p-5">
        <CircleLoading />
      </div>
    );
  }

  const renderHeader = () => {
    return (
      <div className="relative z-20 w-full lg:mx-auto lg:max-w-7xl lg:px-8">
        <div className="flex h-16 items-center gap-x-4 border-b border-neutral-200 px-4 shadow-sm sm:h-20 sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none dark:border-neutral-600">
          <div className="flex flex-1 gap-4 self-stretch lg:gap-6">
            <div className="relative flex flex-1 items-center">
              <Logo />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Separator */}
              <div
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-neutral-200 dark:bg-neutral-600"
                aria-hidden="true"
              />

              {/* Profile dropdown */}
              <div className="flex flex-1 items-center justify-end">
                <CreateBtn className="block" />
                <SwitchDarkMode />
                <AvatarDropdown />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative flex h-[100vh] w-full flex-col">
        {renderHeader()}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CreateNewPostEditor isSubmittingPage />
          </div>
          {props.showRightSidebar && ( // Ensure this prop is defined
            <aside className="lg:col-span-1">
              <div className="rounded-lg border text-card-foreground shadow-sm sticky top-15 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:w-[400px] h-[100%]">
                <div className="flex flex-col space-y-1.5 p-6 pb-3">
                  {/* Add sidebar content here */}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
};

export function getStaticProps(ctx: GetStaticPropsContext) {
  return getNextStaticProps(ctx, {
    Page,
    revalidate: false,
  });
}

export default Page;
