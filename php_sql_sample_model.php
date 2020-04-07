<?php
/*
 * Service/MyPDO/Toplist
 */

namespace AppBundle\Service\MyPDO;

use AppBundle\Service\MyPDO\Core\MyPDOModel;


class Toplist extends MyPDOModel {
    const STATE_PROPOS = 0;
    const STATE_PROPOS_ACCEPTED = 1;
    const STATE_ACTIVE = 2;
    const STATE_DROP = 3;
    const STATE_ARCHIVE = 4;

    private $types = [
        'idSong' => \PDO::PARAM_INT,
        'idUser' => \PDO::PARAM_INT,
        'state' => \PDO::PARAM_INT,
        'week' => \PDO::PARAM_INT,
        'votesBefore' => \PDO::PARAM_INT,
        'votesLast' => \PDO::PARAM_INT,
        'votes' => \PDO::PARAM_INT
    ];


    public function insertSong($song) {
        return $this->insert('toplist', $song, $this->types);
    }

    public function insertPropos($idUser, $songArtist, $songTitle) {
        $idSong = $this->insertSong([
                'idUser' => $idUser,
                'state' => self::STATE_PROPOS,
                'songArtist' => $songArtist,
                'songTitle' => $songTitle,
            ]);

        $stmt = $this->MyPDO->prepare('UPDATE users SET `toplistPropos`=`toplistPropos`+1 WHERE idUser=:idUser');
        $stmt->bindValue(':idUser', intVal($idUser), \PDO::PARAM_INT);
        $stmt->execute();

        return $idSong;
    }

    public function updateSongById($idSong, $song) {
        unset($song['idSong']);
        return $this->update('toplist', $song, ['idSong' => $idSong], $this->types);
    }

    public function deleteSongById($idSong) {
        return $this->delete('toplist', ['idSong' => $idSong], $this->types);
    }

    public function getSongById($idSong) {
        $qs = 'SELECT * FROM `toplist` WHERE `idSong`=:idSong';

        $stmt = $this->MyPDO->prepare($qs);
        $stmt->bindValue(':idSong', intVal($idSong), \PDO::PARAM_INT);

        if($stmt->execute() === false) {
            return false;
        }

        return $stmt->fetch();
    }

    public function getMgrList($pa = false) {
        $sql = 'SELECT * FROM `toplist`' . ($pa ? '' : ' WHERE state <> :STATE_ARCHIVE') . ' ORDER BY votesLast DESC, idSong DESC';

        $stmt = $this->MyPDO->prepare($sql);
        $pa || $stmt->bindValue(':STATE_ARCHIVE', self::STATE_ARCHIVE, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function getShortList() {
        $sql = '
                SELECT
                    toplist.songArtist, toplist.songTitle,
                    posLastTable.posLast
                FROM
                    `toplist`

                INNER JOIN (
                    SELECT toplist.idSong, @posLast := @posLast + 1 AS posLast
                    FROM toplist, (SELECT @posLast := 0) posLast
                    WHERE state = :STATE_ACTIVE
                    ORDER BY `votesLast` DESC, `idSong` DESC
                ) as posLastTable
                ON `posLastTable`.`idSong` = `toplist`.`idSong`

                ORDER BY posLast';

        $stmt = $this->MyPDO->prepare($sql);
        $stmt->bindValue(':STATE_ACTIVE', self::STATE_ACTIVE, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function getListenersList() {
        $sql = '
                SELECT
                    toplist.*,
                    posActiveBeforeTable.posActiveBefore,
                    posActiveLastTable.posActiveLast,
                    posActiveBeforeTable.posActiveBefore - posActiveLastTable.posActiveLast AS posActiveLastDiff,
                    posActiveTable.posActive,
                    posActiveLastTable.posActiveLast - posActiveTable.posActive AS posActiveDiff,
                    posProposAcceptedTable.posProposAccepted
                FROM
                    `toplist`

                LEFT JOIN (
                    SELECT toplist.idSong, @posActive := @posActive + 1 AS posActive
                    FROM toplist, (SELECT @posActive := 0) posActive
                    WHERE state=:STATE_ACTIVE
                    ORDER BY `votes` DESC, `idSong` DESC
                ) as posActiveTable
                ON `posActiveTable`.`idSong` = `toplist`.`idSong`

                LEFT JOIN (
                    SELECT toplist.idSong, @posActiveBefore := @posActiveBefore + 1 AS posActiveBefore
                    FROM toplist, (SELECT @posActiveBefore := 0) posActiveBefore
                    WHERE state=:STATE_ACTIVE
                    ORDER BY `votesBefore` DESC, `idSong` DESC
                ) as posActiveBeforeTable
                ON `posActiveBeforeTable`.`idSong` = `toplist`.`idSong`

                LEFT JOIN (
                    SELECT toplist.idSong, @posActiveLast := @posActiveLast + 1 AS posActiveLast
                    FROM toplist, (SELECT @posActiveLast := 0) posActiveLast
                    WHERE state=:STATE_ACTIVE
                    ORDER BY `votesLast` DESC, `idSong` DESC
                ) as posActiveLastTable
                ON `posActiveLastTable`.`idSong` = `toplist`.`idSong`

                LEFT JOIN (
                    SELECT toplist.idSong, @posProposAccepted := @posProposAccepted + 1 AS posProposAccepted
                    FROM toplist, (SELECT @posProposAccepted := 0) posProposAccepted
                    WHERE state=:STATE_PROPOS_ACCEPTED
                    ORDER BY `votes` DESC, `idSong` DESC
                ) as posProposAcceptedTable
                ON `posProposAcceptedTable`.`idSong` = `toplist`.`idSong`

                WHERE state IN(:STATE_PROPOS_ACCEPTED, :STATE_ACTIVE)
                ORDER BY posActiveLast, posProposAccepted';

        $stmt = $this->MyPDO->prepare($sql);
        $stmt->bindValue(':STATE_PROPOS_ACCEPTED', self::STATE_PROPOS_ACCEPTED, \PDO::PARAM_INT);
        $stmt->bindValue(':STATE_ACTIVE', self::STATE_ACTIVE, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function getSongBySongId($idSong)
     {
        $stmt = $this->MyPDO->prepare('SELECT * FROM toplist WHERE idSong=:idSong');
        $stmt->bindValue(':idSong', intVal($idSong), \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
     }

    function voteBySongIdUserId($idSong, $idUser) {
        $stmt = $this->MyPDO->prepare('UPDATE toplist SET `votes` = `votes`+1 WHERE idSong=:idSong');
        $stmt->bindValue(':idSong', intVal($idSong), \PDO::PARAM_INT);
        $stmt->execute();

        if(!$stmt->rowCount()) return false;

        $stmt = $this->MyPDO->prepare('UPDATE users SET `toplistVotes`=`toplistVotes`+1 WHERE idUser=:idUser');
        $stmt->bindValue(':idUser', intVal($idUser), \PDO::PARAM_INT);
        $stmt->execute();

        return true;
     }

    public function toplistSnapshot($toplistMax, $toplistRenew)
     {
        // users reset
        $stmt = $this->MyPDO->prepare('UPDATE users SET `toplistVotes`=0, `toplistPropos`=0 WHERE 1');
        $stmt->execute();

        // archive dropped
        $sql = 'UPDATE toplist SET state=:STATE_ARCHIVE WHERE state=:STATE_DROP';
        $stmt = $this->MyPDO->prepare($sql);
        $stmt->bindValue(':STATE_ARCHIVE', self::STATE_ARCHIVE, \PDO::PARAM_INT);
        $stmt->bindValue(':STATE_DROP', self::STATE_DROP, \PDO::PARAM_INT);
        $stmt->execute();

        // update toplist
        $sql = '
                UPDATE toplist
                LEFT JOIN (
                    SELECT idSong FROM toplist WHERE state IN(:STATE_ACTIVE, :STATE_PROPOS_ACCEPTED) ORDER BY votes DESC, idSong DESC LIMIT :toplistStay
                ) toplistLimit
                ON toplistLimit.idSong = toplist.idSong
                SET state=:STATE_ACTIVE, week=0, votesBefore=0, votesLast=0
                WHERE state=:STATE_PROPOS_ACCEPTED AND toplistLimit.idSong IS NOT NULL';

        $stmt = $this->MyPDO->prepare($sql);
        $stmt->bindValue(':STATE_ACTIVE', self::STATE_ACTIVE, \PDO::PARAM_INT);
        $stmt->bindValue(':STATE_PROPOS_ACCEPTED', self::STATE_PROPOS_ACCEPTED, \PDO::PARAM_INT);
        $stmt->bindValue(':toplistStay', intVal($toplistMax), \PDO::PARAM_INT);
        $stmt->execute();

        $sql = '
                UPDATE toplist
                LEFT JOIN (
                    SELECT idSong FROM toplist WHERE state=:STATE_ACTIVE ORDER BY votes DESC, idSong DESC LIMIT :toplistStay
                ) toplistLimit
                ON toplistLimit.idSong = toplist.idSong
                SET state=:STATE_DROP
                WHERE state=:STATE_ACTIVE AND toplistLimit.idSong IS NULL';

        $stmt = $this->MyPDO->prepare($sql);
        $stmt->bindValue(':STATE_ACTIVE', self::STATE_ACTIVE, \PDO::PARAM_INT);
        $stmt->bindValue(':STATE_DROP', self::STATE_DROP, \PDO::PARAM_INT);
        $stmt->bindValue(':toplistStay', intVal($toplistMax), \PDO::PARAM_INT);
        $stmt->execute();

        // active votes & week update
        $sql = '
                UPDATE toplist
                SET `votesBefore`=`votesLast`, `votesLast`=`votes`, `week`=`week`+1
                WHERE state=:STATE_ACTIVE';
        $stmt = $this->MyPDO->prepare($sql);
        $stmt->bindValue(':STATE_ACTIVE', self::STATE_ACTIVE, \PDO::PARAM_INT);
        $stmt->execute();

        // active & propos accepted week update
        /*
        $sql = '
                UPDATE toplist
                SET `week`=`week`+1
                WHERE state IN(:STATE_ACTIVE, :STATE_PROPOS_ACCEPTED)';
        $stmt = $this->MyPDO->prepare($sql);
        $stmt->bindValue(':STATE_ACTIVE', self::STATE_ACTIVE, \PDO::PARAM_INT);
        $stmt->bindValue(':STATE_PROPOS_ACCEPTED', self::STATE_PROPOS_ACCEPTED, \PDO::PARAM_INT);
        $stmt->execute();
        */

        return true;
     }
}
