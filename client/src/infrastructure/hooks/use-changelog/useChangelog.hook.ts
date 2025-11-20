import type { ChangeLogEntry } from "../../domain";
import { useDispatch, useSelector } from "react-redux";
import { addChangeLog, clearChangeLog, type RootState } from "../../redux";

export const useChangelog = () => {
    const dispatch = useDispatch();

    const changelogs = useSelector((state: RootState) => state.changeLog.changelogs);

    return {
        changelogs,
        addChangeLog: (changeLog: ChangeLogEntry) => dispatch(addChangeLog(changeLog)),
        clearChangeLog: () => dispatch(clearChangeLog()),
    }
}